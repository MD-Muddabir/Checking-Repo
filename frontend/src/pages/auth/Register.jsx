import { useState } from "react";
import { registerInstitute } from "../../services/auth.service";

const Register = () => {
  const [formData, setFormData] = useState({
    instituteName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerInstitute(formData);
      alert("Institute Registered Successfully!");
    } catch (err) {
      alert("Registration Failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register Institute</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="instituteName"
          placeholder="Institute Name"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
