import React, { useState } from 'react';
import { register } from './api';

function Register() {
  const [form, setForm] = useState({
    nome: '', cpf: '', email: '', endereco: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await register(form);
    alert(response.error || 'Usuário registrado com sucesso!');
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nome" placeholder="Nome" onChange={handleChange} required />
        <input type="text" name="cpf" placeholder="CPF" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="text" name="endereco" placeholder="Endereço" onChange={handleChange} required />
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default Register;
