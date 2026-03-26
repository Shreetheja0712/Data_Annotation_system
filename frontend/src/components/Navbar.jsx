import { initials } from "../utils/helpers";

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">ProjectVault</div>
      <div className="nav-right">
        <div className="nav-user">
          <div className="avatar">{initials(user?.name)}</div>
          <span>{user?.name}</span>
        </div>
        <button className="btn-logout" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}