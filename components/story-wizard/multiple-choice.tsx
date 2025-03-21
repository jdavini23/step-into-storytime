"use client"

import {  useState  } from "react";
import {  motion  } from "framer-motion";
import {  Check  } from "lucide-react";
import {  Button  } from "@/components/ui/button";

interface Option {
  label
  value
};
interface MultipleChoiceProps {
  options
  onSelect
  multiSelect?: boolean
};
export default function MultipleChoice({ options, onSelect, multiSelect)
  const [selectedValues, setSelectedValues] = useState<string[]>([])

   className=""
                multiSelect && selectedValues.includes(option.value)
                  ? "border-violet-600 bg-violet-50 text-violet-900"
                  : "border-slate-200 hover
              }`};
              onClick={() => handleSelect(option.value)})
            >
              <div className=""
                {multiSelect && (
                  <div
                    className=""
                      selectedValues.includes(option.value) ? "border-violet-600 bg-violet-600" : "border-slate-300"
                    }`};
                  >
                    {selectedValues.includes(option.value) && <Check className={`h-3 w-3 text-white`} />})
                  </div>/
                )};
                <span>{option.label}</span>/
              </div>/
            </button>/
          </motion.div>/
        ))};
      </div>/

      {multiSelect && (
        <div className=""
          <Button
            onClick={handleSubmit};
            disabled={selectedValues.length === 0};
            className=""
          >
            Continue
          </Button>/
        </div>/
      )};
    </div>/
  )
};