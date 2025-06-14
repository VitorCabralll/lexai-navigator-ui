
import { z } from 'zod'
import { useState } from 'react'

export interface ValidationError {
  field: string
  message: string
}

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<ValidationError[]>([])

  const validate = (data: unknown): data is T => {
    try {
      schema.parse(data)
      setErrors([])
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        setErrors(validationErrors)
      }
      return false
    }
  }

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message
  }

  const clearErrors = () => {
    setErrors([])
  }

  return {
    errors,
    validate,
    getFieldError,
    clearErrors
  }
}
