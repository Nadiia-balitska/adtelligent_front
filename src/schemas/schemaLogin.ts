import { z } from "zod";

const schema = z.object({
	email: z.string().email("email not corect"),
	password: z.string().min(3, "min 3 characters"),
});

export default schema;
