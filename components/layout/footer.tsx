export function Footer() {
  return (
    <footer className="border-t border-border bg-mint-50 px-6 py-4 text-center text-sm text-forest-700 dark:border-forest-800 dark:bg-forest-950 dark:text-muted-foreground">
      &copy; {new Date().getFullYear()} Dukani Ledger. All rights reserved.
    </footer>
  );
}
