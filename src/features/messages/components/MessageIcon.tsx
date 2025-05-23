// src/features/messages/components/MessageIcon.tsx
"use client";

import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";

export const MessageIcon: React.FC = () => (
  <Button variant="ghost" size="icon" asChild aria-label="Messages">
    <Link to="/messages">
      <MessageSquare className="h-5 w-5" />
    </Link>
  </Button>
);
