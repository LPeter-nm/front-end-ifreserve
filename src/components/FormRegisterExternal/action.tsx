'use server';

import { api } from '@/app/server/api';
import { redirect } from 'next/navigation';

export async function handleSubmit(formdata: FormData) {
  const name = formdata.get('name');
  const address = formdata.get('address');
  const cpf = formdata.get('cpf');
  const phone = formdata.get('phone');
  const email = formdata.get('email');
  const password = formdata.get('password');

  await api.post('user-external/register', {
    name,
    address,
    cpf,
    email,
    password,
    phone,
  });

  return redirect('/');
}
