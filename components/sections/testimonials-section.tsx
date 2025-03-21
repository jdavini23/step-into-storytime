import Image from "next/image";
import {  Users, Star  } from "lucide-react";
import {  Card, CardContent  } from "@/components/ui/card";

export default function TestimonialsSection()  {
  return (
    <section className=""
      <div className=""
        <div className=""
          <div className=""
            <Users className=""
            <span>Happy Families</span>/
          </div>/
          <h2 className=""
          <p className=""
            Join thousands of families creating unforgettable bedtime moments
          </p>/
        </div>/

        <div className=""
          <TestimonialCard
            quote,name,role,image;
          />/
/
          <TestimonialCard
            quote,name,role,image;
          />/
/
          <TestimonialCard
            quote,name,role,image;
          />/
        </div>/
      </div>/
    </section>/
  )
};
function TestimonialCard({ quote, name, role, image }) {
  return (
    <Card className=""
      <CardContent className=""
        <div className=""
          <div className=""
            <div className=""
              <Image src;
            </div>/
          </div>/
          <div>
            <p className=""
            <p className=""
          </div>/
        </div>/
        <div className=""
          <div className=""
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key;
            ))};
          </div>/
          <p className=""
        </div>/
      </CardContent>/
    </Card>/
  )
};