'use server';

import { signIn } from '@/auth';
import { sql } from '@vercel/postgres';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({invalid_type_error: 'Customer ID must be a valid string'}),
  amount: z.coerce.number().gt(0, 'Enter a number > 0'),
  status: z.enum(['pending', 'paid'], {invalid_type_error: 'Select a status'}),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  const validation = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      message: "Failed validating fields"
    }
  }

  const { customerId, amount, status } = validation.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`INSERT INTO invoices(customer_id, amount, status, date)
    VALUES(${customerId}, ${amountInCents}, ${status}, ${date})`;
  } catch (exception) {
    return {message: "Failed to create invoice"};
  }
  
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData): Promise<State | never> {
  const formDataObject = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };
  const validation = UpdateInvoice.safeParse(formDataObject);

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      message: 'Unable to update invoice'
    } 
  }

  const { customerId, amount, status } = UpdateInvoice.parse(formDataObject);
  const amountInCents = amount * 100;

  try {
    await sql`UPDATE invoices 
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}`;
  } catch (exception) {
    return {message: "Failed to update invoice"};
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('failed deletion')
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (exception) {
    return {message: "Failed to update invoice"};
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}