
import { toast as originalToast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react"

interface ToastOptions {
  title: string
  description?: string
  duration?: number
}

export const toast = {
  success: ({ title, description, duration = 4000 }: ToastOptions) => {
    originalToast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          {title}
        </div>
      ),
      description,
      duration,
      className: "border-green-200 bg-green-50"
    })
  },

  error: ({ title, description, duration = 6000 }: ToastOptions) => {
    originalToast({
      title: (
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-600" />
          {title}
        </div>
      ),
      description,
      duration,
      variant: "destructive"
    })
  },

  warning: ({ title, description, duration = 5000 }: ToastOptions) => {
    originalToast({
      title: (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          {title}
        </div>
      ),
      description,
      duration,
      className: "border-yellow-200 bg-yellow-50"
    })
  },

  info: ({ title, description, duration = 4000 }: ToastOptions) => {
    originalToast({
      title: (
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          {title}
        </div>
      ),
      description,
      duration,
      className: "border-blue-200 bg-blue-50"
    })
  }
}
