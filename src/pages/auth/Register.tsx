import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import TextField from "../../components/form/TextField";
import schema from "../../schemas/schemasRegister";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { register } from "../../services/api";
type Form = z.infer<typeof schema>;

export default function Register() {

	 const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
	const {
		register: formRegister,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<Form>({ resolver: zodResolver(schema), mode: "onTouched" });

  const onSubmit = async (v: Form) => {
    try {
      setApiError(null);
	  await register(v.email, v.password);
	  navigate("/"); 
    } catch (e: any) {
      setApiError(e?.message || "Помилка реєстрації");
    }
  };

	return (
		<div className="mx-auto mt-10 max-w-sm space-y-4">
			<h1 className="text-2xl font-bold">Реєстрація</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<TextField<Form>
					name="name"
					label="Імʼя"
					placeholder="Ваше імʼя"
					autoComplete="name"
					register={formRegister}
					error={errors.name}
				/>

				<TextField<Form>
					name="email"
					label="Email"
					type="email"
					placeholder="name@example.com"
					autoComplete="email"
					register={formRegister}
					error={errors.email}
				/>

				<TextField<Form>
					name="password"
					label="Пароль"
					type="password"
					placeholder="Пароль"
					autoComplete="new-password"
					register={formRegister}
					error={errors.password}
				/>

				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
				>
					{isSubmitting ? "Відправляю…" : "Зареєструватись"}
				</button>
			</form>
		</div>
	);
}
