const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

const missingImports = `
import {
  BookOpen, Briefcase, Book, Dumbbell, Utensils, Leaf, Trophy,
  Gamepad2, Calendar, Key, Flame, TrendingUp,
  CheckCircle, Globe, Wrench, Bird, Crown, Skull, Sunrise, Activity, Medal, Pin
} from 'lucide-react';
`;

// Insert after the first import React from "react";
content = content.replace(/import React from "react";/, 'import React from "react";' + missingImports);

fs.writeFileSync(file, content, 'utf8');
console.log("Injected missing Lucide imports!");
