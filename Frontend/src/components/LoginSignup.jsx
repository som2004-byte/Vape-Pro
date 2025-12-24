import React, { useState, useEffect, useRef } from 'react'
import VapeSmokeEffect from './VapeSmokeEffect'
import API_BASE_URL from '../config'


// Bear expressions: IDLE, LOOK_LEFT, LOOK_RIGHT, HAPPY, SHOCK, COVER_EYES
const BearCharacter = ({ expression, eyeAngle = null }) => {
  const getEyes = () => {
    if (expression === 'COVER_EYES') return null

    // Base eye positions (left eye, right eye) - center of each eye socket
    const baseLeftEyeX = 45
    const baseRightEyeX = 65
    const baseEyeY = 50

    // Maximum distance eyes can move from center (in SVG units)
    const maxEyeMovement = 4

    let leftEyeX, leftEyeY, rightEyeX, rightEyeY

    if (eyeAngle !== null) {
      // Calculate eye positions based on angle (in radians)
      // Convert angle to eye offset
      const offsetX = Math.cos(eyeAngle) * maxEyeMovement
      const offsetY = Math.sin(eyeAngle) * maxEyeMovement

      // Move both eyes in the same direction
      leftEyeX = baseLeftEyeX + offsetX
      leftEyeY = baseEyeY + offsetY
      rightEyeX = baseRightEyeX + offsetX
      rightEyeY = baseEyeY + offsetY
    } else {
      // Default centered position
      leftEyeX = baseLeftEyeX
      leftEyeY = baseEyeY
      rightEyeX = baseRightEyeX
      rightEyeY = baseEyeY
    }

    return (
      <>
        <circle cx={leftEyeX} cy={leftEyeY} r="3" fill="black" />
        <circle cx={rightEyeX} cy={rightEyeY} r="3" fill="black" />
      </>
    )
  }

  const getMouth = () => {
    if (expression === 'HAPPY') {
      return (
        <>
          {/* Wide happy smile */}
          <path
            d="M 40 65 Q 55 80 70 65"
            fill="none"
            stroke="black"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Tongue */}
          <ellipse cx="55" cy="72" rx="6" ry="5" fill="#FFB6C1" />
          {/* Teeth */}
          <rect x="50" y="65" width="2" height="5" fill="white" />
          <rect x="54" y="65" width="2" height="5" fill="white" />
          <rect x="58" y="65" width="2" height="5" fill="white" />
        </>
      )
    }
    if (expression === 'SHOCK') {
      return (
        <>
          <ellipse cx="55" cy="68" rx="6" ry="8" fill="black" />
          {/* Teeth showing */}
          <rect x="52" y="65" width="1.5" height="4" fill="white" />
          <rect x="55.5" y="65" width="1.5" height="4" fill="white" />
        </>
      )
    }
    // Default neutral smile
    return (
      <path
        d="M 45 65 Q 55 70 65 65"
        fill="none"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
    )
  }

  const getArms = () => {
    if (expression === 'COVER_EYES') {
      return (
        <>
          {/* Left arm covering eyes */}
          <ellipse cx="40" cy="50" rx="10" ry="14" fill="white" />
          {/* Right arm covering eyes */}
          <ellipse cx="70" cy="50" rx="10" ry="14" fill="white" />
        </>
      )
    }
    // Default arms down
    return (
      <>
        <ellipse cx="30" cy="80" rx="6" ry="10" fill="white" />
        <ellipse cx="80" cy="80" rx="6" ry="10" fill="white" />
      </>
    )
  }

  const getEyebrows = () => {
    if (expression === 'SHOCK') {
      return (
        <>
          {/* Raised eyebrows for shock */}
          <path d="M 38 42 Q 45 38 52 42" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
          <path d="M 58 42 Q 65 38 72 42" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    }
    return null
  }

  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 110 110"
      className="transition-all duration-200 ease-out"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
    >
      {/* Body */}
      <ellipse cx="55" cy="75" rx="35" ry="30" fill="white" />

      {/* Head */}
      <circle cx="55" cy="50" r="30" fill="white" />

      {/* Ears */}
      <circle cx="35" cy="35" r="12" fill="white" />
      <circle cx="75" cy="35" r="12" fill="white" />
      <circle cx="35" cy="35" r="8" fill="#FFB6C1" />
      <circle cx="75" cy="35" r="8" fill="#FFB6C1" />

      {/* Scarf */}
      <ellipse cx="55" cy="65" rx="25" ry="8" fill="#DC143C" />
      <rect x="45" y="60" width="20" height="15" fill="#DC143C" />

      {/* Nose */}
      <ellipse cx="55" cy="58" rx="3" ry="2.5" fill="black" />

      {/* Eyebrows */}
      {getEyebrows()}

      {/* Eyes */}
      {getEyes()}

      {/* Mouth */}
      {getMouth()}

      {/* Arms */}
      {getArms()}
    </svg>
  )
}

export default function LoginSignup({ onLogin, onAdminLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [expression, setExpression] = useState('IDLE')
  const [eyeAngle, setEyeAngle] = useState(null) // Angle in radians for 360-degree eye movement
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const bearRef = useRef(null)
  const videoSrc = '/videos/login-bg.mp4' // put your video file at Frontend/public/videos/login-bg.mp4

  // Track mouse movement to make eyes follow cursor in 360 degrees
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Don't update eye angle if eyes are covered
      if (focusedField === 'password') return

      if (bearRef.current) {
        const bearRect = bearRef.current.getBoundingClientRect()
        const bearCenterX = bearRect.left + bearRect.width / 2
        const bearCenterY = bearRect.top + bearRect.height / 2

        const mouseX = e.clientX
        const mouseY = e.clientY

        // Calculate angle from bear center to cursor (in radians)
        const deltaX = mouseX - bearCenterX
        const deltaY = mouseY - bearCenterY

        // Calculate angle using atan2 (gives full 360 degrees: -π to π)
        const angle = Math.atan2(deltaY, deltaX)

        setEyeAngle(angle)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [focusedField])

  useEffect(() => {
    if (focusedField === 'password') {
      setExpression('COVER_EYES')
      // Eyes are covered, don't change direction
    } else if (focusedField) {
      setExpression('IDLE')
      // Keep current lookDirection from mouse tracking
    } else if (username || password || email) {
      setExpression('HAPPY')
      // Keep current lookDirection from mouse tracking
    } else {
      setExpression('IDLE')
      // Keep current lookDirection from mouse tracking
    }
  }, [focusedField, username, password, email])

  const handleFocus = (field) => {
    setFocusedField(field)
  }

  const handleBlur = () => {
    setFocusedField(null)
  }

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    setExpression('THINKING')

    try {
      // Set the base URL from config
      const endpointBase = API_BASE_URL;

      // Determine the endpoint and request data based on login/signup and admin/user mode
      let endpoint, requestData;

      if (isAdminMode) {
        // Admin login
        endpoint = `${endpointBase}/api/admin/login`;
        requestData = { email: email || username, password };
      } else {
        // User login/signup
        if (isLogin) {
          endpoint = `${endpointBase}/api/login`;
          requestData = { email: email || username, password };
        } else {
          endpoint = `${endpointBase}/api/signup`;
          requestData = { name: username, email, password };
        }
      }

      console.log('Sending request to:', endpoint);
      console.log('Request data:', requestData);

      // Make the API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);

      // Try to parse the response as JSON, but handle non-JSON responses
      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('API Error Response:', data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // On successful login/signup
      setExpression('HAPPY');

      // Handle the response based on admin or user mode
      if (isAdminMode) {
        // For admin login
        if (onAdminLogin) {
          onAdminLogin(data.token, data.admin || data.user);
        }
      } else {
        // For user login/signup
        if (onLogin) {
          onLogin({
            id: data.user?._id || data.user?.id,
            name: data.user?.name || username,
            email: data.user?.email || email,
            token: data.token,
            isLogin: true
          });
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setExpression('SAD')
      setError(err.message || 'Failed to authenticate. Please try again.')
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-100">
      {/* Admin/User Toggle */}
      {/* Admin/User Toggle - Hidden for now */}
      {/* 
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsAdminMode(!isAdminMode)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isAdminMode
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-white text-gray-800 hover:bg-gray-200'
          } shadow-md`}
        >
          {isAdminMode ? 'Switch to User Login' : 'Admin Login'}
        </button>
      </div>
      */}
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Global vape smoke behind overlay */}
      <VapeSmokeEffect density={55} speed={0.55} opacity={0.5} />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/35 to-black/70" />

      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        {/* Brand logo in corner */}
        <div className="absolute top-4 left-4 flex items-center gap-3 px-4 py-2 rounded-full bg-black/50 border border-darkPurple-600/70 backdrop-blur-lg shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          <img
            src="/images/vapesmart-logo.png"
            alt="VapeSmart logo"
            className="h-9 w-9 object-contain"
          />
          <span className="text-base font-semibold bg-gradient-to-r from-white via-yellowGradient-end to-white bg-clip-text text-transparent tracking-wide">
            VapeSmart
          </span>
        </div>

        <div className="w-full max-w-md relative mt-10">
          {/* Teddy Bear Character */}
          <div className="flex justify-center mb-6 -mt-8">
            <div
              ref={bearRef}
              className="relative animate-bounce"
              style={{
                animationDuration: '3s',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
              }}
            >
              <BearCharacter expression={expression} eyeAngle={eyeAngle} />
            </div>
          </div>

          {/* Login/Signup Form */}
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl border border-darkPurple-900/50 shadow-2xl p-8">
            {/* Toggle Buttons */}
            <div className="flex gap-2 mb-6 bg-darkPurple-950/50 rounded-xl p-1">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setUsername('');
                  setPassword('');
                  setEmail('');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${isLogin
                  ? 'bg-gradient-to-r from-darkPurple-600 to-darkPurple-800 text-white shadow-lg'
                  : 'text-darkPurple-300 hover:text-white'
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setUsername('');
                  setPassword('');
                  setEmail('');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${!isLogin
                  ? 'bg-gradient-to-r from-darkPurple-600 to-darkPurple-800 text-white shadow-lg'
                  : 'text-darkPurple-300 hover:text-white'
                  }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => handleFocus('username')}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 bg-darkPurple-950/50 border border-darkPurple-800/50 rounded-xl text-white placeholder-darkPurple-400 focus:outline-none focus:ring-2 focus:ring-darkPurple-600 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {isLogin ? 'Username' : 'Email'}
                </label>
                <input
                  type={isLogin ? 'text' : 'email'}
                  value={isLogin ? username : email}
                  onChange={(e) =>
                    isLogin ? setUsername(e.target.value) : setEmail(e.target.value)
                  }
                  onFocus={() => handleFocus(isLogin ? 'username' : 'email')}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 bg-darkPurple-950/50 border border-darkPurple-800/50 rounded-xl text-white placeholder-darkPurple-400 focus:outline-none focus:ring-2 focus:ring-darkPurple-600 focus:border-transparent transition-all"
                  placeholder={isLogin ? 'Enter your username' : 'Enter your email'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 pr-12 bg-darkPurple-950/50 border border-darkPurple-800/50 rounded-xl text-white placeholder-darkPurple-400 focus:outline-none focus:ring-2 focus:ring-darkPurple-600 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-darkPurple-300 hover:text-darkPurple-100 transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-white">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-darkPurple-600 bg-darkPurple-950/50"
                    />
                    Remember me
                  </label>
                  <a
                    href="#"
                    className="text-white hover:text-white transition"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-gradient-to-r from-darkPurple-600 to-darkPurple-800 text-white font-semibold rounded-xl shadow-lg shadow-darkPurple-900/50 hover:from-darkPurple-700 hover:to-darkPurple-900 transform hover:scale-[1.02] transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Logging in...' : 'Signing up...'}
                  </span>
                ) : isLogin ? 'Login' : 'Sign Up'}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-600/20 border border-red-600/50 text-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </form>

            {!isLogin && (
              <p className="mt-6 text-center text-sm text-white">
                Already have an account?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-white hover:text-white font-medium transition"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

