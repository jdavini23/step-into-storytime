import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './loading-spinner';

interface AuthButtonsProps {
  isAuthenticated: boolean;
  isNavigating: boolean;
  scrolled: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onDashboard: () => void;
  onSignUp: () => void;
  isMobile?: boolean;
}

export function AuthButtons({
  isAuthenticated,
  isNavigating,
  scrolled,
  onLogin,
  onLogout,
  onDashboard,
  onSignUp,
  isMobile = false,
}: AuthButtonsProps) {
  if (isAuthenticated) {
    return (
      <>
        <Button
          variant={isMobile ? 'outline' : 'ghost'}
          className={
            isMobile
              ? 'w-full justify-center rounded-lg border-slate-200 transition-all duration-200 hover:border-violet-200 hover:bg-violet-50/50'
              : `rounded-lg px-4 transition-all duration-300 ${
                  scrolled
                    ? 'text-slate-700 hover:text-violet-600 hover:bg-violet-50'
                    : 'text-slate-700 hover:text-violet-600 hover:bg-white/20'
                } focus:ring-2 focus:ring-violet-500 focus:outline-none active:scale-95`
          }
          onClick={isMobile ? onDashboard : onLogout}
          disabled={isNavigating}
          aria-label={isMobile ? 'Go to dashboard' : 'Log out of your account'}
        >
          <span className="flex items-center gap-2">
            {isNavigating ? (
              <LoadingSpinner />
            ) : isMobile ? (
              'Dashboard'
            ) : (
              'Log out'
            )}
          </span>
        </Button>
        <Button
          className={`${
            isMobile ? 'w-full' : ''
          } justify-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg px-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none active:scale-95 active:translate-y-0`}
          onClick={isMobile ? onLogout : onDashboard}
          disabled={isNavigating}
          aria-label={isMobile ? 'Log out of your account' : 'Go to dashboard'}
        >
          <span className="flex items-center gap-2">
            {isNavigating ? (
              <LoadingSpinner />
            ) : isMobile ? (
              'Log out'
            ) : (
              'Dashboard'
            )}
          </span>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        variant={isMobile ? 'outline' : 'ghost'}
        className={
          isMobile
            ? 'w-full justify-center rounded-lg border-slate-200 transition-all duration-200 hover:border-violet-200 hover:bg-violet-50/50'
            : `rounded-lg px-4 transition-all duration-300 ${
                scrolled
                  ? 'text-slate-700 hover:text-violet-600 hover:bg-violet-50'
                  : 'text-slate-700 hover:text-violet-600 hover:bg-white/20'
              } focus:ring-2 focus:ring-violet-500 focus:outline-none active:scale-95`
        }
        onClick={onLogin}
        disabled={isNavigating}
        aria-label="Sign in to your account"
      >
        <span className="flex items-center">
          {isNavigating ? <LoadingSpinner /> : 'Log in'}
        </span>
      </Button>
      <Button
        className={`${
          isMobile ? 'w-full' : ''
        } justify-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg px-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none active:scale-95 active:translate-y-0`}
        onClick={onSignUp}
        disabled={isNavigating}
        aria-label="Create a new account"
      >
        <span className="flex items-center gap-2">
          {isNavigating ? <LoadingSpinner /> : 'Get Started'}
        </span>
      </Button>
    </>
  );
}
