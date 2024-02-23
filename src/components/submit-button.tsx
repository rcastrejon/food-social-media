import * as React from "react"

import { Button } from "~/components/ui/button"

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>

interface SubmitButtonProps extends ButtonProps {
  isSubmitting: boolean | undefined
}

const SubmitButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  SubmitButtonProps
>(({ isSubmitting, ...props }, ref) => {
  if (isSubmitting) {
    return (
      <Button ref={ref} {...props} disabled>
        <span className="i-[lucide--loader-2] mr-2 h-4 w-4 animate-spin" />
        Por favor espere...
      </Button>
    )
  }
  return <Button ref={ref} {...props} type="submit" />
})
SubmitButton.displayName = "SubmitButton"

export { SubmitButton }
