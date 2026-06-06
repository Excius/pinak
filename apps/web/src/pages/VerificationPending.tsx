import React from 'react'

interface VerificationPendingProps {
  email: string
  onBackToLogin: () => void
}

const VerificationPending: React.FC<VerificationPendingProps> = ({ email, onBackToLogin }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-6 bg-background-light font-body">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="space-y-4">
          <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <span className="material-icons-outlined text-2xl">spa</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-widest text-primary">PINAK</h1>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mx-auto">
            <span className="material-icons-outlined text-4xl text-primary">mail_outline</span>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-3xl font-bold text-text-main-light">
              Check Your Email
            </h2>
            <p className="text-text-muted">
              We've sent a verification link to
            </p>
            <p className="text-lg font-semibold text-primary break-all">
              {email}
            </p>
          </div>

          <div className="bg-surface-dark border border-primary/15 rounded-2xl p-4 space-y-2">
            <p className="text-sm text-primary font-medium">
              Next Steps:
            </p>
            <ol className="text-sm text-text-muted space-y-1 text-left">
              <li>1. Open the email from PINAK</li>
              <li>2. Click on the verification link</li>
              <li>3. You'll be redirected to complete your setup</li>
            </ol>
          </div>

          <div className="space-y-3 pt-4">
            <p className="text-sm text-text-muted">
              Didn't receive the email? Check your spam folder or
            </p>
            <button
              className="w-full py-3 px-4 rounded-2xl font-bold text-black bg-primary hover:bg-primary-hover transition-all cursor-pointer active:scale-95 glow-gold"
              onClick={onBackToLogin}
            >
              Back to Login
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="pt-4 border-t border-primary/10">
          <p className="text-xs text-text-muted">
            The verification link will expire in 24 hours.
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerificationPending
