interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export function Button({
  children,
  className = "",
  isLoading = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`w-full max-w-xs mx-auto block bg-aliceBlue text-raisinBlack py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-darkPurple hover:bg-darkPurple ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-raisinBlack border-t-transparent rounded-full" />
        </div>
      ) : (
        children
      )}
    </button>
  );
}
