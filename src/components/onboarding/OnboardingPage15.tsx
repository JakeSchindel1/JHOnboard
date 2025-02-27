import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, GraduationCap, Home, BookText, DollarSign, LucideIcon } from "lucide-react";
import { OnboardingPageProps } from '@/types';

interface ContentItem {
  title: string;
  text?: string;
  status?: string;
  requirements?: string[];
}

interface ProgramSection {
  icon: LucideIcon;
  content: ContentItem[];
}

interface ProgramSections {
  [key: string]: ProgramSection;
}

interface OnboardingPage15Props extends OnboardingPageProps {
  onComplete: (verified: boolean) => void;
}

const PROGRAM_SECTIONS: ProgramSections = {
  "Program Requirements": {
    icon: BookOpen,
    content: [
      {
        title: "General Requirements",
        text: "All programs require compliance with Rec-cap Assessments, follow-ups, recording progress on your Rec-cap goals regularly, 12-step meeting schedule, checking into groups and appointments within the rec-cap system, communication with staff via group texts, following all house rules, working with a peer and compliance with all administrative, programing and bed fees."
      }
    ]
  },
  "Intensive Monitoring": {
    icon: GraduationCap,
    content: [
      {
        title: "Program Overview",
        text: "All participants that come to Journey House with less than 90 days clean, transitioning from treatment, incarceration, a mental health episode or involuntarily discharged from another VARR organization will be required to participate in our intensive monitoring program. Payment for that program will be determined before intake. Funding Sources include but are not limited to private funding, financing options such as the Advanced Care Card, community organizations, grants, VARR 30-day programs, and scholarships."
      },
      {
        title: "Phase 1",
        text: "With our intensive monitoring program all participants are to do an ASAM assessment to determine their clinical necessity, review drug use history for potential detox referral, create recovery plan, complete rec-cap assessment, have a weekly follow up with peer, come to the center Monday thru Friday, participate in daytime recovery programming, complete an application for food stamps and Medicaid, be assessed for employment readiness (such as IDs), facilitate open communication with supervision and get linked to appropriate mental health resources, scheduled with a PCP (Primary Care Provider), be introduced and demonstrated how to use their insurance resources, food pantry services and have a member of Journey House with them at all times.",
        status: "FULLTIME CENTER ATTENDANCE REQUIRED"
      },
      {
        title: "Phase 2",
        text: "Once they have been assessed, enrolled, and demonstrated at least a week track record of compliance in mental health and treatment services they can request to transition to the next phase and start working part time. At that time, they can begin looking for work around their treatment option schedule, continue working with peers, vocation training and education if needed, engage in activities outside of Journey House, supervision and assistance utilizing and maintaining medical appointments, transportation needs with peers and can work part time. All appointments are still communicated with Journey House staff via group text.",
        status: "PARTTIME CENTER ATTENDANCE REQUIRED"
      },
      {
        title: "Phase 3",
        text: "After a track record of multiple weeks showing compliance with their treatment option, their responsibilities within their recovery residence and work they can request transition to our final phase of intensive programming, which only require participants to be physically present with their treatment option, house meetings, community meetings and follow all house rules and curfews. All meetings and appointments are still reported to Journey House staff, but transportation will have been arranged independently with insurance product or outside support, transportation to the center as needed or required for peer follows up or treatment options.",
        status: "AS NEEDED CENTER ATTENDANCE REQUIRED"
      },
      {
        title: "Transition to Sober Living",
        text: "After completing their treatment option or showing that a participant can balance work, recovery, and their medical obligation they can request to transition into sober living."
      }
    ]
  },
  "Sober Living": {
    icon: Home,
    content: [
      {
        title: "Program Overview",
        text: "Sober Living within Journey House is for individuals who already know how to live a recovery lifestyle. They can schedule their own appointments, find transportation to their appointments, maintain compliance with medication, follow house rules, maintain journey house expectations for meeting attendance and have a job or steady income.",
        status: "AVAILABLE AT CENTER FOR REC-CAP FOLLOWS AND COMMUNITY MEETINGS"
      },
      {
        title: "Important Notice",
        text: "If an individual tests positive while in our sober living program, they will be required to create a new recovery plan which may include transition into our intensive monitoring program. Individuals coming from other organization, the community or outside referral resources who fail their intake drug screen regardless of previous conversations with staff will be transitioned into our intensive monitoring program if they wish to remain at Journey House."
      }
    ]
  },
  "Step-Up": {
    icon: DollarSign,
    content: [
      {
        title: "Program Overview",
        text: "Step Up within Journey House is intended for participants who demonstrate success in recovery and are interested in maintaining a recovery lifestyle in continue to work on themselves and enjoy less restrictions because their track record has demonstrated that they can maintain a recovery lifestyle. They do not have to demonstrate that track record within Journey House they have a history of success in the community or other organization with confirmation through the organization and referrals.",
        status: "AVAILABLE AT CENTER FOR REC-CAP FOLLOWS AND COMMUNITY MEETINGS"
      },
      {
        title: "Requirements",
        text: "",
        requirements: [
          "Must have verified employment and income",
          "Must have history of paying bed fees up to date with previous organization",
          "Must have history of NEGATIVE drug tests for a minimum of 3 months (90 days) or 3 months clean/sober (verified by another organization or JH)"
        ]
      },
      {
        title: "Obligations",
        requirements: [
          "All residents are to contribute to household necessities (trash bags, toilet paper, dish soap, paper towels etc)",
          "Must comply with random drug testing (at JH center)",
          "Current on bed fees/rent payments (weekly)",
          "Maintain clean & tidy bedroom/bed space & contribute to cleaning common areas of residence"
        ]
      },
      {
        title: "Rules & Regulations",
        requirements: [
          "No Curfew",
          "Guests need to be communicated with house members & agreeance with roommate for overnight guest",
          "Residents must contribute to upkeep/cleanliness of common areas and bedrooms/bed spaces",
          "Bed Fees must be paid/current. If payments are missed, residents will be moved back to regular recovery residence immediately",
          "Must attend monthly JH community meeting (held LAST Wednesday every month)",
          "Provide random urine screens to staff at JH center during business hours",
          "Failed drug screens result in movement back into a regular recovery residence and a new recovery plan. Which may include a period in our intensive monitoring program"
        ]
      },
      {
        title: "Housing Options",
        requirements: [
          "Step Up I: (Cottage-men's & Stoneman- women's)- weekly cost of $175.00 per week, utilities included. (Shared rooms 2 per room)",
          "Step Up II: (Dumbarton- women's)- monthly cost of $700.00 per month PLUS utilities split between residents monthly. (Single rooms per resident)"
        ]
      },
      {
        title: "Included Utilities",
        requirements: [
          "Electricity/Power",
          "Wi-Fi",
          "Water",
          "Trash"
        ]
      }
    ]
  }
};

export default function OnboardingPage15({ 
    formData,
    handleInputChange,
    handleSelectChange,
    setCurrentPage,
    onComplete 
}: OnboardingPage15Props) {
  const [viewedSections, setViewedSections] = useState<Set<string>>(new Set());
  const [isFullyViewed, setIsFullyViewed] = useState(false);
  const [pageLoadTime, setPageLoadTime] = useState(Date.now());
  const [hasScrolled, setHasScrolled] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reduced minimum time required to read (in milliseconds)
  const MIN_READ_TIME = 3000; // 3 seconds, reduced from 10 seconds

  useEffect(() => {
    // Set initial scroll position to top
    window.scrollTo(0, 0);
    
    // Add scroll listener
    const handleScroll = () => {
      setHasScrolled(true);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check which sections are already visible on initial load
  useEffect(() => {
    const checkInitialVisibility = () => {
      Object.entries(sectionRefs.current).forEach(([sectionId, element]) => {
        if (element && isElementInViewport(element)) {
          setViewedSections(prev => new Set([...Array.from(prev), sectionId]));
        }
      });
    };

    // Check after a short delay to ensure refs are set
    const timer = setTimeout(checkInitialVisibility, 500);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to check if element is in viewport
  const isElementInViewport = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with better settings
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Only process entries if user has scrolled
        if (!hasScrolled) {
          return;
        }

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            // Mark this section as viewed
            setViewedSections(prev => {
              const newSet = new Set([...Array.from(prev), entry.target.id]);
              
              // Check if all sections are now viewed
              const totalSections = Object.keys(PROGRAM_SECTIONS).length;
              if (newSet.size === totalSections) {
                const timeSpent = Date.now() - pageLoadTime;
                
                // Only complete if minimum time has passed
                if (timeSpent >= MIN_READ_TIME) {
                  setIsFullyViewed(true);
                  onComplete(true);
                }
              }
              
              return newSet;
            });
          }
        });
      },
      {
        root: null,
        rootMargin: "0px", // Changed from 100px to be more precise
        threshold: [0.3, 0.6], // Multiple thresholds for better detection
      }
    );

    // Observe all section elements
    Object.keys(PROGRAM_SECTIONS).forEach(section => {
      if (sectionRefs.current[section]) {
        observerRef.current?.observe(sectionRefs.current[section]!);
      }
    });

    // Add a fallback timer that completes after reasonable time if user has scrolled
    const fallbackTimer = setTimeout(() => {
      if (hasScrolled && viewedSections.size > 0) {
        const timeSpent = Date.now() - pageLoadTime;
        if (timeSpent >= MIN_READ_TIME * 2) {
          setIsFullyViewed(true);
          onComplete(true);
        }
      }
    }, 15000); // 15 seconds fallback

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearTimeout(fallbackTimer);
    };
  }, [hasScrolled, pageLoadTime, onComplete, viewedSections]);

  // When sections are viewed, check if all have been viewed
  useEffect(() => {
    const totalSections = Object.keys(PROGRAM_SECTIONS).length;
    const timeSpent = Date.now() - pageLoadTime;
    
    if (viewedSections.size === totalSections && timeSpent >= MIN_READ_TIME && hasScrolled) {
      setIsFullyViewed(true);
      onComplete(true);
    }
  }, [viewedSections, pageLoadTime, hasScrolled, onComplete]);

  const setRef = (section: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[section] = el;
  };

  const totalSections = Object.keys(PROGRAM_SECTIONS).length;
  const progressPercentage = Math.min((viewedSections.size / totalSections) * 100, 100);
  const timeSpent = Date.now() - pageLoadTime;
  const canComplete = timeSpent >= MIN_READ_TIME && hasScrolled;

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto space-y-6 pb-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Journey House Programs</h1>
        <p className="text-gray-600">Please review all program information carefully</p>
      </div>

      <div className="grid gap-4">
        {Object.entries(PROGRAM_SECTIONS).map(([section, { icon: Icon, content }]) => {
          const isViewed = viewedSections.has(section);
          
          return (
            <Card 
              key={section} 
              ref={setRef(section)} 
              id={section}
              className={`scroll-mt-4 min-h-[100px] transition-all duration-300 ${
                isViewed ? 'border-green-200' : ''
              }`}
            >
              <CardHeader className={`border-b ${isViewed ? 'bg-green-50' : 'bg-blue-50'}`}>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Icon className={`h-5 w-5 ${isViewed ? 'text-green-500' : 'text-blue-500'}`} />
                  {section}
                  {isViewed && (
                    <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Viewed
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-6">
                  {content.map((item, index) => (
                    <div key={index} className="space-y-3">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      {item.text && <p className="text-gray-700">{item.text}</p>}
                      {item.status && (
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <p className="text-blue-800 font-medium text-sm">{item.status}</p>
                        </div>
                      )}
                      {item.requirements && (
                        <div className="space-y-2">
                          {item.requirements.map((req, reqIndex) => (
                            <div key={reqIndex} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                              <div className="h-2 w-2 mt-2 shrink-0 rounded-full bg-blue-400" />
                              <p className="text-gray-700">{req}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation and Progress Container */}
      <div className="mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <p className="text-sm text-gray-600">
                  {!canComplete 
                    ? "Please take time to review all sections carefully" 
                    : isFullyViewed 
                      ? "All sections have been reviewed" 
                      : `You've reviewed ${viewedSections.size} of ${totalSections} sections`}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2.5">
              <div 
                className={`${
                  isFullyViewed ? 'bg-green-500' : 'bg-blue-500'
                } h-2.5 rounded-full transition-all duration-300`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}