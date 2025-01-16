export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  symbol: string;
}

export interface CharacterArchetype {
  id: string;
  name: string;
  classId: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  startingGear: {
    weapons: string[];
    armor: string[];
    items: string[];
  };
}

export const CHARACTER_CLASSES: CharacterClass[] = [
  {
    id: 'sales',
    name: 'Sales Representative',
    description: 'Master of cold calls and aggressive quota pursuit.',
    symbol: '📊'
  },
  {
    id: 'accounting',
    name: 'Senior Accountant',
    description: 'Number-crunching mastermind with a flair for "creative" accounting.',
    symbol: '💻'
  },
  {
    id: 'hr',
    name: 'HR Manager',
    description: 'Policy enforcer and keeper of corporate secrets.',
    symbol: '👥'
  },
  {
    id: 'it',
    name: 'IT Specialist',
    description: 'Digital troubleshooter who knows where the bodies are buried.',
    symbol: '🖥️'
  },
  {
    id: 'marketing',
    name: 'Marketing Specialist',
    description: 'Social media manipulator and trend exploiter.',
    symbol: '📱'
  },
  {
    id: 'management',
    name: 'Middle Manager',
    description: 'Professional meeting scheduler and responsibility delegator.',
    symbol: '📋'
  },
  {
    id: 'operations',
    name: 'Operations Manager',
    description: 'Process optimizer who knows every office shortcut and system weakness.',
    symbol: '☕'
  },
  {
    id: 'facilities',
    name: 'Facilities Manager',
    description: 'Master of building secrets and maintenance mysteries.',
    symbol: '🖨️'
  },
  {
    id: 'admin',
    name: 'Executive Assistant',
    description: 'Gatekeeper of schedules and wielder of office intel.',
    symbol: '💧'
  },
  {
    id: 'finance',
    name: 'Financial Analyst',
    description: 'Number prophet who predicts corporate futures.',
    symbol: '📽️'
  },
  {
    id: 'legal',
    name: 'Legal Counsel',
    description: 'Corporate law warrior and contract manipulator.',
    symbol: '📝'
  },
  {
    id: 'communications',
    name: 'Communications Director',
    description: 'Master of corporate spin and damage control.',
    symbol: '📨'
  },
  {
    id: 'project-management',
    name: 'Project Manager',
    description: 'Deadline juggler and scope creep assassin.',
    symbol: '⌛'
  },
  {
    id: 'procurement',
    name: 'Procurement Specialist',
    description: 'Master negotiator and budget stretcher.',
    symbol: '💰'
  },
  {
    id: 'quality',
    name: 'Quality Assurance',
    description: 'Professional fault-finder and process critic.',
    symbol: '🗡️'
  },
  {
    id: 'research',
    name: 'Research Analyst',
    description: 'Data detective and market intelligence gatherer.',
    symbol: '🌀'
  }
];

export const CHARACTER_ARCHETYPES: CharacterArchetype[] = [
  // Sales Archetypes
  {
    id: 'cold-caller',
    name: 'Cold Calling Specialist',
    classId: 'sales',
    description: 'Fearless phone warrior who turns cold leads into hot prospects.',
    strengths: ['Phone communication', 'Persistence'],
    weaknesses: ['Paperwork', 'In-person meetings'],
    startingGear: {
      weapons: ['Bluetooth Headset', 'Sales Script', 'Business Cards'],
      armor: ['Power Suit', 'Lucky Tie', 'Dress Shoes'],
      items: ['Lead List', 'Coffee Thermos', 'Motivational Book']
    }
  },
  {
    id: 'account-manager',
    name: 'Account Manager',
    classId: 'sales',
    description: 'Relationship builder who maintains key client accounts.',
    strengths: ['Client relations', 'Contract negotiation'],
    weaknesses: ['Cold calling', 'Technical details'],
    startingGear: {
      weapons: ['Premium Pen Set', 'Expense Account', 'Golf Clubs'],
      armor: ['Designer Suit', 'Gold Watch', 'Leather Briefcase'],
      items: ['Client Portfolio', 'Restaurant Guide', 'Thank You Cards']
    }
  },
  // Accounting Archetypes
  {
    id: 'auditor',
    name: 'Internal Auditor',
    classId: 'accounting',
    description: 'Financial detective who ensures compliance and catches discrepancies.',
    strengths: ['Risk assessment', 'Process analysis'],
    weaknesses: ['Social interaction', 'Rushed deadlines'],
    startingGear: {
      weapons: ['Audit Checklist', 'Red Flags Guide', 'Policy Manual'],
      armor: ['Business Casual Attire', 'Stress Ball', 'Ergonomic Chair'],
      items: ['Audit Software', 'Document Scanner', 'Highlighter Set']
    }
  },
  // HR Archetypes
  {
    id: 'recruiter',
    name: 'Talent Recruiter',
    classId: 'hr',
    description: 'Expert at finding and attracting top talent to the company.',
    strengths: ['Networking', 'Candidate assessment'],
    weaknesses: ['Administrative tasks', 'Conflict resolution'],
    startingGear: {
      weapons: ['LinkedIn Premium', 'Business Cards', 'Interview Questions'],
      armor: ['Professional Blazer', 'Name Badge', 'Company Lanyard'],
      items: ['Resume Database', 'Job Fair Banner', 'Benefits Package']
    }
  },
  {
    id: 'mediator',
    name: 'Workplace Mediator',
    classId: 'hr',
    description: 'Skilled negotiator who resolves workplace conflicts.',
    strengths: ['Conflict resolution', 'Policy enforcement'],
    weaknesses: ['Technical knowledge', 'Direct confrontation'],
    startingGear: {
      weapons: ['HR Handbook', 'Complaint Forms', 'Meeting Schedule'],
      armor: ['Power Suit', 'Neutral Expression', 'Comfortable Heels'],
      items: ['Mediation Guide', 'Stress Relief Kit', 'Company Policies']
    }
  },
  // Marketing Archetypes
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    classId: 'marketing',
    description: 'Master of metrics and market insights.',
    strengths: ['Data analysis', 'Pattern recognition'],
    weaknesses: ['Creative tasks', 'Public speaking'],
    startingGear: {
      weapons: ['Analytics Dashboard', 'SQL Queries', 'Report Generator'],
      armor: ['Business Casual', 'Reading Glasses', 'Ergonomic Chair'],
      items: ['Market Reports', 'Competitor Analysis', 'KPI Dashboard']
    }
  },
  // Operations Archetypes
  {
    id: 'process-engineer',
    name: 'Process Engineer',
    classId: 'operations',
    description: 'Expert in streamlining workflows and optimizing efficiency.',
    strengths: ['Process optimization', 'System analysis'],
    weaknesses: ['People management', 'Creative thinking'],
    startingGear: {
      weapons: ['Process Map', 'Efficiency Metrics', 'SOP Manual'],
      armor: ['Safety Vest', 'Steel-Toed Boots', 'Hard Hat'],
      items: ['Workflow Diagrams', 'Time Studies', 'Quality Reports']
    }
  },
  {
    id: 'logistics-coordinator',
    name: 'Logistics Coordinator',
    classId: 'operations',
    description: 'Master of supply chains and resource movement.',
    strengths: ['Resource management', 'Schedule optimization'],
    weaknesses: ['Direct confrontation', 'Public speaking'],
    startingGear: {
      weapons: ['Shipping Schedule', 'Inventory List', 'Route Map'],
      armor: ['Warehouse Uniform', 'Safety Shoes', 'Visibility Vest'],
      items: ['Tracking System', 'Shipping Labels', 'Manifest Forms']
    }
  },
  // Facilities Archetypes
  {
    id: 'security-specialist',
    name: 'Security Specialist',
    classId: 'facilities',
    description: 'Guardian of building access and security protocols.',
    strengths: ['Security systems', 'Access control'],
    weaknesses: ['Customer service', 'Paperwork'],
    startingGear: {
      weapons: ['Security Badge', 'Access Codes', 'Camera Controls'],
      armor: ['Security Uniform', 'Tactical Vest', 'Steel-Toed Boots'],
      items: ['Security Logs', 'Key Cards', 'Incident Reports']
    }
  },
  {
    id: 'maintenance-tech',
    name: 'Maintenance Technician',
    classId: 'facilities',
    description: 'Expert in building systems and emergency repairs.',
    strengths: ['Technical repairs', 'Problem solving'],
    weaknesses: ['Documentation', 'Office politics'],
    startingGear: {
      weapons: ['Tool Belt', 'Master Keys', 'Diagnostic Tools'],
      armor: ['Work Coveralls', 'Safety Glasses', 'Work Gloves'],
      items: ['Repair Manual', 'Spare Parts', 'Work Orders']
    }
  },
  // Finance Archetypes
  {
    id: 'risk-analyst',
    name: 'Risk Analyst',
    classId: 'finance',
    description: 'Expert in identifying and mitigating financial risks.',
    strengths: ['Risk assessment', 'Data analysis'],
    weaknesses: ['Communication', 'Quick decisions'],
    startingGear: {
      weapons: ['Risk Models', 'Market Data', 'Analysis Tools'],
      armor: ['Business Suit', 'Smart Watch', 'Designer Glasses'],
      items: ['Risk Reports', 'Market Forecasts', 'Compliance Docs']
    }
  },
  {
    id: 'investment-banker',
    name: 'Investment Banker',
    classId: 'finance',
    description: 'Deal-maker and market manipulator.',
    strengths: ['Negotiation', 'Market analysis'],
    weaknesses: ['Work-life balance', 'Ethical concerns'],
    startingGear: {
      weapons: ['Financial Models', 'Deal Book', 'Market Access'],
      armor: ['Bespoke Suit', 'Designer Watch', 'Power Tie'],
      items: ['Client List', 'Deal Memos', 'Term Sheets']
    }
  },
  // Legal Archetypes
  {
    id: 'corporate-lawyer',
    name: 'Corporate Lawyer',
    classId: 'legal',
    description: 'Expert in corporate law and contract manipulation.',
    strengths: ['Contract law', 'Negotiation'],
    weaknesses: ['Technical details', 'Public speaking'],
    startingGear: {
      weapons: ['Legal Precedents', 'Contract Templates', 'Case Law'],
      armor: ['Power Suit', 'Designer Glasses', 'Leather Briefcase'],
      items: ['Law Books', 'Case Files', 'Legal Pad']
    }
  },
  {
    id: 'compliance-officer',
    name: 'Compliance Officer',
    classId: 'legal',
    description: 'Guardian of corporate regulations and policies.',
    strengths: ['Regulation knowledge', 'Detail orientation'],
    weaknesses: ['Flexibility', 'Innovation'],
    startingGear: {
      weapons: ['Compliance Manual', 'Audit Checklist', 'Policy Guide'],
      armor: ['Conservative Suit', 'Reading Glasses', 'ID Badge'],
      items: ['Regulation Books', 'Violation Reports', 'Training Materials']
    }
  },
  // Communications Archetypes
  {
    id: 'crisis-manager',
    name: 'Crisis Manager',
    classId: 'communications',
    description: 'Expert in damage control and narrative shaping.',
    strengths: ['Crisis management', 'Media relations'],
    weaknesses: ['Long-term planning', 'Detail work'],
    startingGear: {
      weapons: ['Press Releases', 'Media Contacts', 'Crisis Playbook'],
      armor: ['Media-Ready Suit', 'Bluetooth Earpiece', 'Smart Phone'],
      items: ['Media List', 'Statement Templates', 'Emergency Protocols']
    }
  },
  {
    id: 'pr-strategist',
    name: 'PR Strategist',
    classId: 'communications',
    description: 'Master of public perception and brand messaging.',
    strengths: ['Message crafting', 'Stakeholder management'],
    weaknesses: ['Technical details', 'Direct confrontation'],
    startingGear: {
      weapons: ['Brand Guidelines', 'Media Kit', 'Messaging Framework'],
      armor: ['Designer Outfit', 'Smart Watch', 'Portfolio'],
      items: ['Press Kit', 'Campaign Materials', 'Analytics Reports']
    }
  },
  {
    id: 'social-media',
    name: 'Social Media Manager',
    classId: 'marketing',
    description: 'Digital influencer who manages brand presence online.',
    strengths: ['Trend awareness', 'Content creation'],
    weaknesses: ['Traditional marketing', 'Long-term planning'],
    startingGear: {
      weapons: ['Smartphone', 'Content Calendar', 'Hashtag Strategy'],
      armor: ['Trendy Outfit', 'Blue Light Glasses', 'Wireless Earbuds'],
      items: ['Analytics Tools', 'Meme Collection', 'Brand Guidelines']
    }
  },
  {
    id: 'brand-strategist',
    name: 'Brand Strategist',
    classId: 'marketing',
    description: 'Creative visionary who shapes company image and messaging.',
    strengths: ['Strategic planning', 'Creative direction'],
    weaknesses: ['Data analysis', 'Budget constraints'],
    startingGear: {
      weapons: ['Design Software', 'Brand Book', 'Market Research'],
      armor: ['Designer Glasses', 'Creative Casual', 'Statement Piece'],
      items: ['Mood Board', 'Focus Group Results', 'Competition Analysis']
    }
  },
  // Management Archetypes
  {
    id: 'project-manager',
    name: 'Project Manager',
    classId: 'project-management',
    description: 'Organizational master who keeps projects on track.',
    strengths: ['Task coordination', 'Timeline management'],
    weaknesses: ['Technical expertise', 'Work-life balance'],
    startingGear: {
      weapons: ['Project Management Software', 'Gantt Chart', 'Status Report'],
      armor: ['Business Casual', 'Smart Watch', 'Laptop Bag'],
      items: ['Timeline Template', 'Risk Register', 'Team Calendar']
    }
  },
  {
    id: 'agile-coach',
    name: 'Agile Coach',
    classId: 'project-management',
    description: 'Master of ceremonies who guides teams through the agile process.',
    strengths: ['Team facilitation', 'Process improvement'],
    weaknesses: ['Traditional management', 'Documentation'],
    startingGear: {
      weapons: ['Scrum Board', 'Sprint Backlog', 'Burndown Chart'],
      armor: ['Casual Wear', 'Running Shoes', 'Sticky Notes'],
      items: ['Retrospective Kit', 'Planning Poker', 'User Stories']
    }
  },
  {
    id: 'team-lead',
    name: 'Team Lead',
    classId: 'management',
    description: 'Hands-on leader who guides team success.',
    strengths: ['Team motivation', 'Problem solving'],
    weaknesses: ['Strategic planning', 'Budget management'],
    startingGear: {
      weapons: ['Performance Metrics', 'Team Goals', 'Feedback Forms'],
      armor: ['Casual Friday Outfit', 'Company Badge', 'Standing Desk'],
      items: ['Team Building Games', 'Recognition Awards', 'Development Plans']
    }
  },
  {
    id: 'tax-specialist',
    name: 'Tax Specialist',
    classId: 'accounting',
    description: 'Expert in navigating complex tax regulations.',
    strengths: ['Tax code knowledge', 'Attention to detail'],
    weaknesses: ['Public speaking', 'Office politics'],
    startingGear: {
      weapons: ['Calculator', 'Red Pen', 'Tax Code Manual'],
      armor: ['Reading Glasses', 'Cardigan', 'Comfortable Chair'],
      items: ['Tax Software', 'Filing Cabinet', 'Sticky Notes']
    }
  },
  // IT Support Archetypes
  {
    id: 'security-analyst',
    name: 'Security Analyst',
    classId: 'it',
    description: 'Digital guardian who protects against cyber threats.',
    strengths: ['Threat detection', 'Security protocols'],
    weaknesses: ['User training', 'Documentation'],
    startingGear: {
      weapons: ['Security Scanner', 'Firewall Config', 'Penetration Tools'],
      armor: ['VPN Access', 'Encrypted Device', 'Security Token'],
      items: ['Threat Reports', 'Access Logs', 'Security Patches']
    }
  },
  {
    id: 'data-engineer',
    name: 'Data Engineer',
    classId: 'it',
    description: 'Pipeline architect who manages data infrastructure.',
    strengths: ['Data modeling', 'System optimization'],
    weaknesses: ['Front-end design', 'Client communication'],
    startingGear: {
      weapons: ['Query Optimizer', 'ETL Tools', 'Data Pipeline'],
      armor: ['Cloud Access', 'Database Credentials', 'Admin Rights'],
      items: ['Schema Diagrams', 'Data Dictionary', 'Backup Scripts']
    }
  },
  {
    id: 'sys-admin',
    name: 'System Administrator',
    classId: 'it',
    description: 'Guardian of servers and network infrastructure.',
    strengths: ['System maintenance', 'Security protocols'],
    weaknesses: ['User communication', 'Documentation'],
    startingGear: {
      weapons: ['Server Access', 'Network Tools', 'Command Line'],
      armor: ['Tech T-Shirt', 'Cargo Pants', 'Security Badge'],
      items: ['Backup Drives', 'Network Map', 'Emergency Protocols']
    }
  },
  {
    id: 'help-desk',
    name: 'Help Desk Technician',
    classId: 'it',
    description: 'First line of defense against technical issues.',
    strengths: ['Troubleshooting', 'Patience'],
    weaknesses: ['Complex networking', 'Documentation'],
    startingGear: {
      weapons: ['Admin Password', 'USB Drive', 'Remote Access Tool'],
      armor: ['Casual Polo', 'Jeans', 'Comfortable Sneakers'],
      items: ['Ticket System', 'Energy Drinks', 'How-To Guides']
    }
  },
  // Research Archetypes
  {
    id: 'market-researcher',
    name: 'Market Researcher',
    classId: 'research',
    description: 'Data hunter who uncovers market trends and consumer insights.',
    strengths: ['Data analysis', 'Pattern recognition'],
    weaknesses: ['Decision making', 'Public speaking'],
    startingGear: {
      weapons: ['Survey Tools', 'Analytics Software', 'Focus Group Kit'],
      armor: ['Professional Attire', 'Recording Device', 'Tablet'],
      items: ['Research Reports', 'Market Data', 'Competitor Analysis']
    }
  },
  {
    id: 'competitive-analyst',
    name: 'Competitive Analyst',
    classId: 'research',
    description: 'Strategic spy who monitors and analyzes competitor activities.',
    strengths: ['Strategic thinking', 'Information gathering'],
    weaknesses: ['Direct confrontation', 'Team collaboration'],
    startingGear: {
      weapons: ['Industry Reports', 'Monitoring Tools', 'SWOT Analysis'],
      armor: ['Business Suit', 'Laptop Case', 'Smart Glasses'],
      items: ['Competitor Profiles', 'Strategy Maps', 'Trend Reports']
    }
  },
  // Quality Assurance Archetypes
  {
    id: 'test-engineer',
    name: 'Test Engineer',
    classId: 'quality',
    description: 'Bug hunter who ensures product quality through rigorous testing.',
    strengths: ['Detail orientation', 'Problem identification'],
    weaknesses: ['Development speed', 'User experience'],
    startingGear: {
      weapons: ['Test Suite', 'Bug Tracker', 'Automation Tools'],
      armor: ['Casual Clothes', 'Ergonomic Chair', 'Multiple Monitors'],
      items: ['Test Cases', 'Bug Reports', 'Testing Guidelines']
    }
  },
  {
    id: 'quality-auditor',
    name: 'Quality Auditor',
    classId: 'quality',
    description: 'Process inspector who ensures compliance with quality standards.',
    strengths: ['Standard enforcement', 'Documentation'],
    weaknesses: ['Team morale', 'Agile adaptation'],
    startingGear: {
      weapons: ['Audit Checklist', 'Compliance Manual', 'Inspection Tools'],
      armor: ['Professional Suit', 'Safety Gear', 'Clipboard'],
      items: ['Quality Manual', 'Audit Reports', 'ISO Standards']
    }
  },
  // Procurement Archetypes
  {
    id: 'vendor-manager',
    name: 'Vendor Manager',
    classId: 'procurement',
    description: 'Relationship builder who manages supplier partnerships.',
    strengths: ['Negotiation', 'Relationship building'],
    weaknesses: ['Technical details', 'Internal politics'],
    startingGear: {
      weapons: ['Contract Templates', 'Vendor Database', 'Performance Metrics'],
      armor: ['Business Formal', 'Leather Portfolio', 'Business Cards'],
      items: ['Vendor Profiles', 'SLA Documents', 'Partnership Agreements']
    }
  },
  {
    id: 'sourcing-specialist',
    name: 'Sourcing Specialist',
    classId: 'procurement',
    description: 'Deal hunter who finds the best suppliers and prices.',
    strengths: ['Market research', 'Cost analysis'],
    weaknesses: ['Long-term planning', 'Vendor relations'],
    startingGear: {
      weapons: ['RFP Templates', 'Pricing Models', 'Sourcing Tools'],
      armor: ['Business Casual', 'Calculator Watch', 'Supply Chain Maps'],
      items: ['Price Lists', 'Supplier Directory', 'Cost Analysis']
    }
  },
  // Admin Archetypes
  {
    id: 'office-coordinator',
    name: 'Office Coordinator',
    classId: 'admin',
    description: 'Master of office logistics and daily operations.',
    strengths: ['Organization', 'Multi-tasking'],
    weaknesses: ['Strategic planning', 'Technical skills'],
    startingGear: {
      weapons: ['Calendar System', 'Supply Inventory', 'Office Manual'],
      armor: ['Business Casual', 'Comfortable Shoes', 'Name Badge'],
      items: ['Office Supplies', 'Contact List', 'Floor Plans']
    }
  },
  {
    id: 'executive-coordinator',
    name: 'Executive Coordinator',
    classId: 'admin',
    description: 'High-level assistant managing executive affairs.',
    strengths: ['Discretion', 'Priority management'],
    weaknesses: ['Work boundaries', 'Technical depth'],
    startingGear: {
      weapons: ['Executive Calendar', 'Travel Itinerary', 'Contact Network'],
      armor: ['Designer Suit', 'Smart Watch', 'Premium Phone'],
      items: ['VIP Contact List', 'Travel Documents', 'Meeting Minutes']
    }
  }
];

export const OFFICE_LOCATIONS = [
  {
    name: 'TechCorp HQ',
    description: 'A sleek skyscraper in Silicon Valley',
    departments: [
      'Engineering Floor',
      'Executive Suite',
      'Marketing Department',
      'Sales Floor',
      'HR Office',
      'IT Department',
      'Break Room',
      'Conference Rooms'
    ]
  },
  {
    name: 'Global Finance Inc.',
    description: 'A prestigious Wall Street institution',
    departments: [
      'Trading Floor',
      'Risk Management',
      'Investment Banking',
      'Compliance Office',
      'Executive Level',
      'Client Meeting Rooms',
      'Analysis Department',
      'IT Security'
    ]
  },
  {
    name: 'Startup Hub',
    description: 'A trendy co-working space in a converted warehouse',
    departments: [
      'Open Plan Area',
      'Phone Booths',
      'Community Kitchen',
      'Meeting Pods',
      'Event Space',
      'Game Room',
      'Quiet Zone',
      'Rooftop Garden'
    ]
  },
  {
    name: 'Media Central',
    description: 'A dynamic media company in a downtown high-rise',
    departments: [
      'Creative Studio',
      'Content Team',
      'Production Floor',
      'Edit Suites',
      'Social Media Hub',
      'Broadcasting Center',
      'Green Room',
      'Writers\' Room'
    ]
  },
  {
    name: 'Government Agency',
    description: 'A mysterious department in a secure facility',
    departments: [
      'Operations Center',
      'Records Division',
      'Security Office',
      'Data Center',
      'Archive Room',
      'Briefing Room',
      'Research Lab',
      'Clearance Zone'
    ]
  }
];

export const DAILY_TASKS = [
  'Client Meeting',
  'Quarterly Report',
  'Team Building',
  'Performance Review',
  'Project Deadline',
  'Office Party Planning',
  'Budget Review',
  'Training Session'
];

export function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getArchetypesForClass(classId: string): CharacterArchetype[] {
  return CHARACTER_ARCHETYPES.filter(archetype => archetype.classId === classId);
}