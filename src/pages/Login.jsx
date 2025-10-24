import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContextApi';

const AuthForm = () => {
  const [formType, setFormType] = useState('login');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'male',
  });
  const { updateUser } = useUser();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formType === 'signup' && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      const endpoint = formType === 'signup' ? '/auth/user/signup' : '/auth/user/login';

      // Only send required fields for login/signup
      let payload;
      if (formType === 'signup') {
        payload = {
          fullname: formData.fullname,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          gender: formData.gender,
        };
      } else {
        payload = {
          email: formData.email,
          password: formData.password,
        };
      }

      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'API Error');
      }

      toast.success(data.message || 'Success!');
      if (formType === 'signup') {
        navigate('/login');
      }
      if (formType === 'login') {
        // updateUser expects only user info, not the whole response
        if (data) updateUser(data);
        document.cookie = `jwt=${data.token}; path=/;`;
        navigate('/home');
        console.log('Login successful:', data);
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-800 text-white">
      <div className="bg-white text-gray-900 p-8 rounded-lg shadow-white shadow-2xl w-full max-w-md m-2">
        <h2 className="text-3xl font-extrabold text-center mb-6">
          {formType === 'signup' ? 'Sign Up' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formType === 'signup' && (
            <>
              <div className="flex items-center border rounded-lg p-2 bg-gray-100">
                <FaUser className="text-purple-500 mr-2" />
                <input
                  type="text"
                  name="fullname"
                  placeholder="Full Name"
                  className="w-full bg-transparent focus:outline-none"
                  onChange={handleChange}
                  value={formData.fullname}
                  required
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-gray-100">
                <FaUser className="text-purple-500 mr-2" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username (e.g., Jondo99)"
                  className="w-full bg-transparent focus:outline-none"
                  onChange={handleChange}
                  value={formData.username}
                  required
                />
              </div>
            </>
          )}
          <div className="flex items-center border rounded-lg p-2 bg-gray-100">
            <FaEnvelope className="text-purple-500 mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full bg-transparent focus:outline-none"
              onChange={handleChange}
              value={formData.email}
              required
            />
          </div>
          <div className="flex items-center border rounded-lg p-2 bg-gray-100">
            <FaLock className="text-purple-500 mr-2" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full bg-transparent focus:outline-none"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>
          {formType === 'signup' && (
            <div className="flex items-center border rounded-lg p-2 bg-gray-100">
              <FaLock className="text-purple-500 mr-2" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full bg-transparent focus:outline-none"
                onChange={handleChange}
                value={formData.confirmPassword}
                required
              />
            </div>
          )}
          {formType === 'signup' && (
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Female
              </label>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-purple-500 text-white py-2 rounded-lg hover:opacity-90 transition duration-300"
            disabled={loading}
          >
            {loading ? 'Loading...' : formType === 'signup' ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          {formType === 'signup' ? (
            <>
              Already have an account?{' '}
              <button
                className="underline text-purple-500"
                onClick={() => setFormType('login')}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                className="underline text-purple-500"
                onClick={() => setFormType('signup')}
              >
                Register
              </button>
            </>
          )}
        </p>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default AuthForm;
