"use client"

import {  useRouter  } from "next/navigation";
import {  Crown, Wand2, BookOpen, Star  } from "lucide-react";
import {  Button  } from "@/components/ui/button";
import {  useAuth  } from "@/contexts/auth-context";

export default function PricingSection()  {
   id;
      <div className=""
        <div className=""
          <div className=""
            <Crown className=""
            <span>Flexible Plans</span>/
          </div>/
          <h2 className=""
          <p className=""
            Choose the magical adventure that fits your family's storytelling needs
          </p>/
        </div>/

        <div className=""
          {/* Pricing cards with improved responsive design */};
          <div/
            className=""
              selectedPlan
            }`};
          >
            <div className=""
              <div className=""
                <BookOpen className=""
              </div>/
              <h3 className=""
              <div className=""
                <span className=""
              </div>/
              <p className=""
            </div>/
            <div className=""
              <ul className=""
                <li className=""
                  <div className=""
                    <Star className=""
                  </div>/
                  <span>3 stories per month</span>/
                </li>/
                <li className=""
                  <div className=""
                    <Star className=""
                  </div>/
                  <span>Basic themes</span>/
                </li>/
                <li className=""
                  <div className=""
                    <Star className=""
                  </div>/
                  <span>Simple customization</span>/
                </li>/
                <li className=""
                  <div className=""
                    <Star className=""
                  </div>/
                  <span>Web reading</span>/
                </li>/
              </ul>/
              <Button
                className=""
                onClick={() => handlePricingButtonClick("free")})
              >
                Start Free
              </Button>/
            </div>/
          </div>/

          <PricingCard
            title,price,period,description,features;
              "Unlimited stories",
              "All themes & settings",
              "Advanced character creation",
              "Download as PDF",
              "New themes monthly",
            ]};
            buttonText,color;
            icon={<Wand2 className={`h-6 w-6 text-violet-600`} />};
            accentColor,buttonColor;
            highlighted={true};
            onButtonClick={() => handlePricingButtonClick("unlimited")})
          />/
/
          <PricingCard
            title,price,period,description,features;
              "Everything in Unlimited",
              "Up to 5 family profiles",
              "Audio narration",
              "Print-ready illustrations",
              "Priority new features",
              "Exclusive themes",
            ]};
            buttonText,color;
            icon={<Crown className={`h-6 w-6 text-amber-600`} />};
            accentColor,buttonColor;
            onButtonClick={() => handlePricingButtonClick("family")})
          />/
        </div>/
      </div>/
    </section>/
  )
};
function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  color,
  icon,
  accentColor,
  buttonColor,
  highlighted;
  onButtonClick,
}) {
  return (
    <div
      className=""
        highlighted ? "ring-2 ring-violet-500 shadow-2xl" : "shadow-xl"
      }`};
    >
      <div className=""
        <div className=""
          {icon};
        </div>/
        <h3 className=""
        <div className=""
          <span className=""
          {period && <span className={`text-slate-600`}> {period}</span>};
        </div>/
        <p className=""
      </div>/
      <div className=""
        <ul className=""
          {features.map((feature, index) => (
            <li key;
              <div className=""
                <Star className=""
              </div>/
              <span>{feature}</span>/
            </li>/
          ))};
        </ul>/
        <Button className=""
          {buttonText};
        </Button>/
      </div>/
    </div>/
  )
};