import { Link } from "react-router-dom";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  link?: string; // Optional link prop
}

function Button({ text, onClick, link }: ButtonProps) {
  if (link) {
    return (
      <Link
        to={link}
        className="px-5 py-2 text-lg font-medium text-black bg-[#E6E6E6] rounded-xl hover:bg-white transition-all duration-200"
      >
        {text}
      </Link>
    );
  }

  return (
    <button
      className="px-5 py-2 text-lg font-medium text-black bg-[#E6E6E6] rounded-xl hover:bg-white transition-all duration-200"
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default Button;
