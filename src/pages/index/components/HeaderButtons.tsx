
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn, LogOut } from 'lucide-react';

interface HeaderButtonsProps {
  user: any;
  onSignOut: () => void;
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({ user, onSignOut }) => {
  return (
    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2 z-50">
      {user ? (
        <Button onClick={onSignOut} variant="outline" className="bg-background/80 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3">
          <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Sign Out</span>
          <span className="sm:hidden">Out</span>
        </Button>
      ) : (
        <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3">
          <Link to="/auth">
            <LogIn className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Login</span>
            <span className="sm:hidden">Login</span>
          </Link>
        </Button>
      )}
      <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3">
        <Link to="/ask-ai">
          <span className="hidden sm:inline">Ask our AI</span>
          <span className="sm:hidden">AI</span>
        </Link>
      </Button>
    </div>
  );
};

export default HeaderButtons;
