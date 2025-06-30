
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
    <div className="absolute top-4 right-4 flex gap-2 z-50">
      {user ? (
        <Button onClick={onSignOut} variant="outline" className="bg-background/80 backdrop-blur-sm">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      ) : (
        <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm">
          <Link to="/auth">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Link>
        </Button>
      )}
      <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm">
        <Link to="/ask-ai">Ask our AI</Link>
      </Button>
    </div>
  );
};

export default HeaderButtons;
