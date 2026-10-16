import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader, MapPin } from "lucide-react";
import { motion } from "framer-motion"; // for animation
import { useUserStore } from "../stores/useUserStore";
import usePageTitle from "../utils/usePageTitle";

const SignupPage = () => {

  usePageTitle("Sign up");

  const [formData, setFormData] = useState({
		name: "",
		email: "",
		address: "",
		password: "",
		confirmPassword: "",
	});

  const {signup,loading} = useUserStore()

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    signup(formData)
  }
  return (
    <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <motion.div
      initial={{ opacity: 0,y:-20 }} // -20 means from up to down, 20 means from down to up
      animate={{ opacity: 1, y:0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Was an <h2>: the page had no <h1> at all (a browser audit measured
            h1=[]). Same classes, so it looks unchanged. */}
        <h1 className='mt-6 text-center text-3xl font-extrabold text-black'>Create your account</h1>
      </motion.div>

      <motion.div
			className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, delay: 0.2 }}
		>
        <div className="bg-[#1d2925] py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
				<label htmlFor='name' className='block text-sm font-medium text-gray-300'>
					Full name
				</label>
				<div className='mt-1 relative rounded-md shadow-sm'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<User className='h-5 w-5 text-gray-400' aria-hidden='true' />
					</div>
					<input
						id='name'
						type='text'
						required
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm
							placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-white'
						placeholder='John Doe'
					/>
				</div>
			</div>

            <div>
				<label htmlFor='email' className='block text-sm font-medium text-gray-300'>
					Email address
				</label>
				<div className='mt-1 relative rounded-md shadow-sm'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
					</div>
					<input
						id='email'
						type='email'
						required
						value={formData.email}
						onChange={(e) => setFormData({ ...formData, email: e.target.value })}
						className=' block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
						rounded-md shadow-sm
							placeholder-gray-400 focus:outline-none focus:ring-sky-500 
							focus:border-sky-500 sm:text-sm text-white'
						placeholder='you@example.com'
					/>
				</div>
			</div>

			<div>
				<label htmlFor='address' className='block text-sm font-medium text-gray-300'>
					Address
				</label>
				<div className='mt-1 relative rounded-md shadow-sm'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<MapPin className='h-5 w-5 text-gray-400' aria-hidden='true' />
					</div>
					<input
						id='address'
						type='text'
						required
						value={formData.address}
						onChange={(e) => setFormData({ ...formData, address: e.target.value })}
						className=' block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
						rounded-md shadow-sm
							placeholder-gray-400 focus:outline-none focus:ring-sky-500 
							focus:border-sky-500 sm:text-sm text-white'
						placeholder='123 ABC Street'
					/>
				</div>
			</div>

			<div>
				<label htmlFor='password' className='block text-sm font-medium text-gray-300'>
					Password
				</label>
				<div className='mt-1 relative rounded-md shadow-sm'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
					</div>
					<input
						id='password'
						type='password'
						required
						value={formData.password}
						onChange={(e) => setFormData({ ...formData, password: e.target.value })}
						className=' block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
						rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-white'
						placeholder='••••••••'
					/>
				</div>
			</div>

			<div>
				<label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-300'>
					Confirm Password
				</label>
				<div className='mt-1 relative rounded-md shadow-sm'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
					</div>
					<input
						id='confirmPassword'
						type='password'
						required
						value={formData.confirmPassword}
						onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
						className=' block w-full px-3 py-2 pl-10 bg-gray-700 border
							border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-white'
						placeholder='••••••••'
					/>
				</div>
			</div>

			<button
				type='submit'
				className='w-full flex justify-center py-2 px-4 border border-transparent 
				rounded-md shadow-sm text-sm font-medium text-white bg-[#4E6E5D]
					hover:bg-[#445a4e] focus:outline-none focus:ring-2 focus:ring-offset-2
					focus:ring-sky-500 transition duration-150 ease-in-out disabled:opacity-50'
				disabled={loading}
			>
				{loading ? (
					<>
						<Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
						Loading...
					</>
				) : (
					<>
						<UserPlus className='mr-2 h-5 w-5' aria-hidden='true' />
						Sign up
					</>
				)}
			</button>

            <p className='mt-8 text-center text-sm text-gray-400'>
              Already have an account?{" "}
              <Link to='/login' className='font-medium text-sky-400 hover:text-sky-300'>
                Login here <ArrowRight className='inline h-4 w-4' />
              </Link>
			</p>

          </form>
        </div>
      </motion.div>

    </div>
  )
}

export default SignupPage