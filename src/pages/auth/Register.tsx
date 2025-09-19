import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import TextField from "../../components/form/TextField";
import schema from "../../schemas/schemasRegister";

type Form = z.infer<typeof schema>;

export default function Register() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<Form>({ resolver: zodResolver(schema), mode: "onTouched" });

	const onSubmit = (v: Form) => console.log("register form:", v);

	return (
		<div className="mx-auto mt-10 max-w-sm space-y-4">
			<h1 className="text-2xl font-bold">Реєстрація</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<TextField<Form>
					name="name"
					label="Імʼя"
					placeholder="Ваше імʼя"
					autoComplete="name"
					register={register}
					error={errors.name}
				/>

				<TextField<Form>
					name="email"
					label="Email"
					type="email"
					placeholder="name@example.com"
					autoComplete="email"
					register={register}
					error={errors.email}
				/>

				<TextField<Form>
					name="password"
					label="Пароль"
					type="password"
					placeholder="Пароль"
					autoComplete="new-password"
					register={register}
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
