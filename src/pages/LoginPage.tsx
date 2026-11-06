import { useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router"

import { AuthLayout } from "@/components/auth/AuthLayout"
import { FormAlert } from "@/components/auth/shared"
import { SubmitButton } from "@/components/dashboard/actions/shared"
import { buttonVariants } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuthActions } from "@/hooks/useAuth"
import { loginErrorMessage } from "@/lib/authErrors"
import { cn } from "@/lib/utils"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** On success the auth state flips to authenticated and <GuestRoute> redirects away. */
export function LoginPage() {
  const { login } = useAuthActions()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const errors = {
    email: !email.trim()
      ? "Email is required."
      : !EMAIL_PATTERN.test(email)
        ? "Enter a valid email address."
        : undefined,
    password: !password ? "Password is required." : undefined,
  }
  const hasErrors = Boolean(errors.email || errors.password)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    setFormError(null)
    if (hasErrors) return

    setSubmitting(true)
    try {
      await login({ email: email.trim(), password })
    } catch (err) {
      setFormError(loginErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to access your dashboard."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className={cn(buttonVariants({ variant: "link" }), "h-auto p-0 text-sm")}>
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError && <FormAlert message={formError} />}

        <Field label="Email" htmlFor="login-email" error={touched ? errors.email : undefined}>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={touched && !!errors.email}
            className="h-10"
          />
        </Field>

        <Field label="Password" htmlFor="login-password" error={touched ? errors.password : undefined}>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={touched && !!errors.password}
            className="h-10"
          />
        </Field>

        <SubmitButton submitting={submitting}>Sign in</SubmitButton>
      </form>
    </AuthLayout>
  )
}
