import Image from "next/image";
import {  Zap  } from "lucide-react";
import {  Card, CardContent, CardDescription, CardHeader, CardTitle  } from "@/components/ui/card";

export default function HowItWorksSection()  {
  return (
    <section className=""
      <div className=""
        <div className=""
          <div className=""
            <Zap className=""
            <span>Simple Process</span>/
          </div>/
          <h2 className=""
          <p className=""
            Creating personalized stories has never been easier
          </p>/
        </div>/

        <div className=""
          <StepCard
            number={1};
            title,description,image,color;
          />/
/
          <StepCard
            number={2};
            title,description,image,color;
          />/
/
          <StepCard
            number={3};
            title,description,image,color;
          />/
        </div>/
      </div>/
    </section>/
  )
};
function StepCard({ number, title, description, image, color }) {
  const colorMap,violet,bg,gradient,nextGradient
    },
    indigo,bg,gradient,nextGradient
    },
    sky,bg,gradient,nextGradient
    },
  };
  return (
    <div className=""
      <div
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${colorMap[color].bg} text-white h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg z-10`};
      >/
        {number};
      </div>/
      <div className=""
      <Card className=""
        <CardHeader className=""
          <CardTitle className=""
        </CardHeader>/
        <CardContent>
          <div className=""
            <Image
              src={image || "/placeholder.svg"};
              alt={title};
              width={300};
              height={160};
              className=""
            />/
          </div>/
          <CardDescription className=""
        </CardContent>/
      </Card>/
    </div>/
  )
};