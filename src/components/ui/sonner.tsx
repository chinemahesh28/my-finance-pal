import { useFinance } from "@/contexts/FinanceContext";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { isDarkMode } = useFinance();
  const theme = isDarkMode ? "dark" : "light";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.success]:bg-success group-[.success]:text-success-foreground group-[.error]:bg-destructive group-[.error]:text-destructive-foreground group-[.info]:bg-info group-[.info]:text-info-foreground group-[.warning]:bg-warning group-[.warning]:text-warning-foreground",
          description: "group-[.toast]:opacity-90 group-[.toast]:text-inherit",
          actionButton: "group-[.toast]:bg-primary-foreground group-[.toast]:text-primary",
          cancelButton: "group-[.toast]:bg-white/20 group-[.toast]:text-inherit",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
