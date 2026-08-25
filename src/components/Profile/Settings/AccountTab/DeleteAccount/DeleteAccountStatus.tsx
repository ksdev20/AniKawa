import type { AccountDeletionStatus } from "@/lib/account/deletion/types";

interface DeleteAccountStatusProps {
  status: AccountDeletionStatus;
}

export default function DeleteAccountStatus({
  status,
}: DeleteAccountStatusProps) {
  const waitingComplete =
    status.waitingPeriodComplete || status.remainingMs <= 0;

  return (
    <section
      className="delete-account-status"
      aria-labelledby="delete-account-status-title"
    >
      <div className="delete-account-status__header">
        <div>
          <span className="delete-account-status__eyebrow">
            Deletion requirements
          </span>

          <h3
            id="delete-account-status-title"
            className="delete-account-status__title"
          >
            Complete all steps before deletion
          </h3>
        </div>
      </div>

      <ol className="delete-account-status__steps">
        <StatusStep
          step={1}
          title="Password verified"
          description="Your account password must be confirmed before a deletion request can be created."
          complete={status.passwordVerified}
        />

        <StatusStep
          step={2}
          title="Email verified"
          description="Open the verification link sent to your account email address."
          complete={status.emailVerified}
        />

        <StatusStep
          step={3}
          title="24-hour waiting period"
          description={
            waitingComplete
              ? "The mandatory waiting period is complete."
              : "Your account must remain active for 24 hours before permanent deletion becomes available."
          }
          complete={waitingComplete}
          active={!waitingComplete}
        />
      </ol>
    </section>
  );
}

interface StatusStepProps {
  step: number;
  title: string;
  description: string;
  complete: boolean;
  active?: boolean;
}

function StatusStep({
  step,
  title,
  description,
  complete,
  active = false,
}: StatusStepProps) {
  const stateClass = complete
    ? "delete-account-status__step--complete"
    : active
      ? "delete-account-status__step--active"
      : "delete-account-status__step--pending";

  return (
    <li className={`delete-account-status__step ${stateClass}`}>
      <div className="delete-account-status__step-indicator">
        {complete ? <CheckIcon /> : step}
      </div>

      <div className="delete-account-status__step-content">
        <div className="delete-account-status__step-heading">
          <h4 className="delete-account-status__step-title">{title}</h4>

          <span className="delete-account-status__step-state">
            {complete ? "Complete" : active ? "In progress" : "Pending"}
          </span>
        </div>

        <p className="delete-account-status__step-description">{description}</p>
      </div>
    </li>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
    </svg>
  );
}
