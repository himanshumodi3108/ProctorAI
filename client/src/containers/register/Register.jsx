import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { CtaButton } from '../../components';
import './register.css';
import axios from 'axios';

const Register = () => {
	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		password: '',
	});
	const [otp, setOtp] = useState('');
	const [otpSent, setOtpSent] = useState(false);
	const [isOtpVerified, setIsOtpVerified] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [resendTimer, setResendTimer] = useState(0);
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false); // 👁️ State for Password Visibility

	// ⏳ Countdown Timer for Resend OTP
	useEffect(() => {
		let interval;
		if (otpSent && resendTimer > 0) {
			interval = setInterval(() => {
				setResendTimer((prev) => prev - 1);
			}, 1000);
		} else if (resendTimer === 0) {
			clearInterval(interval);
		}
		return () => clearInterval(interval);
	}, [otpSent, resendTimer]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	// 🔹 Send OTP Function
	const sendOTP = async () => {
		if (!formData.email.trim()) {
			setError('Please enter a valid email.');
			return;
		}

		// Prevent OTP resend before 30s
		if (otpSent && resendTimer > 0) {
			setError(`Please wait ${resendTimer}s before resending OTP.`);
			return;
		}

		try {
			setLoading(true);
			const response = await axios.post('http://localhost:5000/api/send-otp', { email: formData.email });

			if (response.data.success) {
				setOtpSent(true);
				setResendTimer(30); // ✅ Reset Timer when OTP is sent
				setError('');
			} else {
				setError(response.data.message);
			}
		} catch (err) {
			setError('Failed to send OTP. Try again.');
		}
		setLoading(false);
	};

	// 🔹 Verify OTP Function
	const verifyOTP = async () => {
		if (!otp.trim()) {
			setError('Please enter a valid OTP.');
			return;
		}

		try {
			setLoading(true);
			const response = await axios.post('http://localhost:5000/api/verify-otp', {
				email: formData.email.trim(),
				otp: otp.trim(),
			});

			if (response.data.success) {
				setIsOtpVerified(true);
				setOtpSent(false);
				setResendTimer(0); // ✅ Disable Resend OTP permanently after verification
				setError('');
			} else {
				setError('Invalid OTP. Try again.');
			}
		} catch (err) {
			setError('Invalid OTP. Try again.');
		}
		setLoading(false);
	};

	// 🔹 Register User Function
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!isOtpVerified) {
			setError('Please verify OTP before submitting.');
			return;
		}

		const data = {
			fullName: formData.fullName.trim(),
			email: formData.email.trim(),
			password: formData.password.trim(),
		};

		console.log("🔹 Sending Registration Request:", data);

		try {
			const response = await axios.post('http://localhost:5000/api/register', data, {
				headers: { 'Content-Type': 'application/json' },
			});

			alert('🎉 Registration successful!');
			navigate('/login');
		} catch (error) {
			console.error('❌ Registration failed:', error);
			setError(error.response?.data?.message || "Something went wrong during registration!");
		}
	};

	return (
		<div className="user-register">
			<Navbar />
			<h1 className="title-heading">Register</h1>
			<div className="register-form">
				<form className="input-fields" onSubmit={handleSubmit}>
					{/* Full Name Input */}
					<div className="input-group">
						<input
							type="text"
							name="fullName"
							placeholder="Full Name"
							value={formData.fullName}
							onChange={handleChange}
							required
							style={{
								width: '140%',
								padding: '12px',
								border: '1px solid #ccc',
								borderRadius: '8px',
								fontSize: '14px',
								fontFamily: "'Poppins', sans-serif",
								outline: 'none',
							}}
						/>
					</div>

					{/* Email Input & Send OTP Button */}
					<div className="input-col">
						<div className="input-group">
							<input
								type="email"
								name="email"
								placeholder="Email ID"
								value={formData.email}
								onChange={handleChange}
								required
								disabled={isOtpVerified}
								className="email-verified-input"
								style={{
									width: '140%',
									padding: '12px',
									border: '1px solid #ccc',
									borderRadius: '8px',
									fontSize: '14px',
									fontFamily: "'Poppins', sans-serif",
									outline: 'none',
								}}
							/>
						</div>
						{!isOtpVerified && (
							<CtaButton
								text={otpSent && resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Send OTP'}
								onClick={sendOTP}
								disabled={otpSent && resendTimer > 0} // ✅ Resend OTP is disabled until timer ends
								className={`otp-btn ${otpSent ? "resend-otp-btn" : "send-otp-btn"} ${otpSent && resendTimer > 0 ? "disabled-btn" : ""}`}
							/>
						)}
					</div>

					{/* OTP Verified Message */}
					{isOtpVerified && <p className="otp-verified-msg">✅ Email Verified</p>}

					{/* OTP Input & Verify Button */}
					{otpSent && !isOtpVerified && (
						<div className="input-col">
							<div className="input-group">
								<input
									type="text"
									placeholder="Enter OTP"
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									required
									style={{
										width: '140%',
										padding: '12px',
										border: '1px solid #ccc',
										borderRadius: '8px',
										fontSize: '14px',
										fontFamily: "'Poppins', sans-serif",
										outline: 'none',
									}}
								/>
							</div>
							<CtaButton text="Verify OTP" onClick={verifyOTP} className="verify-otp-btn" />
						</div>
					)}

					{/* Password Input with Show/Hide Icon */}
					{isOtpVerified && (
						<div className="input-col">
							<div className="input-group">
								<div className="password-container">
									<input
										type={showPassword ? "text" : "password"} // 👁️ Toggle Type
										name="password"
										placeholder="Password"
										value={formData.password}
										onChange={handleChange}
										required
										style={{
											width: '140%',
											padding: '12px',
											border: '1px solid #ccc',
											borderRadius: '8px',
											fontSize: '14px',
											fontFamily: "'Poppins', sans-serif",
											outline: 'none',
										}}
									/>
								</div>
							</div>

						{/* Register Button  */}
							<CtaButton text="Register" type="submit" disabled={!isOtpVerified} />
						</div>
					)}


					{/* Register Button
					<CtaButton text="Register" type="submit" disabled={!isOtpVerified} /> */}

					{/* Error Message */}
					{error && <p className="error-msg">*{error}</p>}
				</form>
				<p
					style={{
						textAlign: 'center',
						marginTop: '10px',
						fontSize: '14px',
						fontFamily: "'Poppins', sans-serif",
					}}
				>
					Already have an account?{' '}
					<span
						style={{ color: '#007BFF', cursor: 'pointer', textDecoration: 'underline' }}
						onClick={() => navigate('/login')}
					>
						Login
					</span>
				</p>
			</div>
		</div>
	);
};

export default Register;