import type z from "zod";
import { EntityFormSchema } from "../../../../../core/presentation/schemas/entityForm.schema";

export const EmployeeStatusFormSchema = EntityFormSchema.extend({

});

export type EmployeeStatusFormValues = z.infer<typeof EmployeeStatusFormSchema>;