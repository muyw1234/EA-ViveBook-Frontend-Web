// Una copia de ImageFrame
export default function AvatarFrame(props: { avatar: string | undefined; name: string }) {
  if (props.avatar)
    return <img className="profile-avatar" src={props.avatar} height="512px" width="512px"></img>;
  else
    return (
      <div className="profile-avatar">{(props.name || 'U').substring(0, 2).toUpperCase()}</div>
    );
}
