export function AuthDivider() {
  return (
    <div className="relative w-full">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs text-muted-foreground">
        <span className="bg-card px-2">or continue with email</span>
      </div>
    </div>
  );
}
