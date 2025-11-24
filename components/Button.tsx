import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-4 rounded-2xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none";
  
  const variants = {
    primary: "bg-haven-500 text-white hover:bg-haven-600 shadow-lg shadow-haven-200",
    secondary: "bg-white text-haven-700 hover:bg-haven-50 border border-haven-100 shadow-sm",
    danger: "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-200",
    outline: "border-2 border-haven-300 text-haven-700 hover:bg-haven-50",
    ghost: "bg-transparent text-haven-500 hover:bg-haven-50 hover:text-haven-700"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};