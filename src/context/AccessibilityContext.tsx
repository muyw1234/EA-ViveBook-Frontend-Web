import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { applyFocusReading } from '../utils/focusReading';

interface AccessibilityContextType {
  isFocusModeEnabled: boolean;
  toggleFocusMode: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  isFocusModeEnabled: false,
  toggleFocusMode: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

// A map to store the original text of nodes we modify, so we can restore it.
const originalTextMap = new WeakMap<Text, string>();

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFocusModeEnabled, setIsFocusModeEnabled] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const storedValue = localStorage.getItem('focusReadingMode');
    if (storedValue !== null) {
      setIsFocusModeEnabled(storedValue === 'true');
    }
  }, []);

  const toggleFocusMode = (value: boolean) => {
    setIsFocusModeEnabled(value);
    localStorage.setItem('focusReadingMode', value.toString());
  };

  const shouldSkipElement = (element: Element | null): boolean => {
    if (!element) return false;
    const tagName = element.tagName.toLowerCase();
    if (
      tagName === 'script' ||
      tagName === 'style' ||
      tagName === 'textarea' ||
      tagName === 'input' ||
      tagName === 'select' ||
      tagName === 'option' ||
      tagName === 'code' ||
      tagName === 'pre'
    ) {
      return true;
    }
    // Also skip editable content
    if ((element as any).isContentEditable) {
      return true;
    }
    return shouldSkipElement(element.parentElement);
  };

  const applyFocusToNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      const originalVal = textNode.nodeValue || '';

      // Skip empty or purely whitespace text
      if (!originalVal.trim()) return;

      // Skip if parent should be skipped
      if (shouldSkipElement(textNode.parentElement)) return;

      // Save original text if not already saved
      if (!originalTextMap.has(textNode)) {
        originalTextMap.set(textNode, originalVal);
      }

      const transformed = applyFocusReading(originalVal);
      if (textNode.nodeValue !== transformed) {
        textNode.nodeValue = transformed;
      }
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        applyFocusToNode(node.childNodes[i]);
      }
    }
  };

  const restoreAllNodes = () => {
    const traverseAndRestore = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        if (originalTextMap.has(textNode)) {
          const original = originalTextMap.get(textNode);
          if (original !== undefined && textNode.nodeValue !== original) {
            textNode.nodeValue = original;
          }
        }
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          traverseAndRestore(node.childNodes[i]);
        }
      }
    };
    traverseAndRestore(document.body);
  };

  useEffect(() => {
    if (isFocusModeEnabled) {
      // Apply focus reading to the existing body
      applyFocusToNode(document.body);

      // Start observing mutations for dynamically added content
      const observer = new MutationObserver((mutations) => {
        // Disconnect temporarily to avoid infinite loops when we mutate text
        observer.disconnect();

        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            applyFocusToNode(node);
          });
          // Also handle text content changes in existing text nodes
          if (mutation.type === 'characterData') {
            const textNode = mutation.target as Text;
            const originalVal = textNode.nodeValue || '';
            if (originalVal && !originalTextMap.has(textNode)) {
              originalTextMap.set(textNode, originalVal);
              const transformed = applyFocusReading(originalVal);
              if (textNode.nodeValue !== transformed) {
                textNode.nodeValue = transformed;
              }
            }
          }
        });

        // Re-observe
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      observerRef.current = observer;
    } else {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      restoreAllNodes();
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isFocusModeEnabled]);

  return (
    <AccessibilityContext.Provider value={{ isFocusModeEnabled, toggleFocusMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
