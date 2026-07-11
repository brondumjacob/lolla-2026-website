import { signOut } from '@/app/auth/actions';

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="nav-signout">
        Sign out
      </button>
    </form>
  );
}
