// Legacy code
export default "https://ea3upc.matomo.cloud";
/*
import { useEffect } from 'react';
import type ILibro from '../../Models/Libro';

// https://matomo.org/faq/new-to-piwik/how-do-i-start-tracking-data-with-matomo-on-websites-that-use-react/
// https://matomo.org/faq/reports/implement-event-tracking-with-matomo/

// Un pequeño bypass para un observer; un gran bypass para los problemas del desarrollo full stack https://stackoverflow.com/questions/56457935/typescript-error-property-x-does-not-exist-on-type-window
declare global {
    interface Window {
        _mtm:any;
    }
}

async function AddingBook(data : Partial<ILibro>){
    var _mtm = window._mtm = window._mtm || [];
    _mtm.push(['trackEvent', 'Libro', 'Adding Book', data.type as string]);
}

export default {AddingBook}; */

