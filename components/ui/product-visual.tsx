import { cn } from "@/lib/utils";
import type { ProductVisualVariant } from "@/lib/mock-track-products";

type ProductVisualProps = {
  variant: ProductVisualVariant;
  compact?: boolean;
};

function Cylinder({ className = "" }: { className?: string }) {
  return (
    <div className={cn("relative h-44 w-24", className)}>
      <div className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 rounded-md bg-[#252525] shadow-[0_10px_18px_rgba(0,0,0,0.18)]" />
      <div className="absolute left-1/2 top-8 h-8 w-2.5 -translate-x-1/2 rounded-full bg-[#969696]" />
      <div className="absolute bottom-0 left-1/2 h-28 w-18 -translate-x-1/2 rounded-[999px] bg-gradient-to-b from-[#4c4c4c] via-[#262626] to-[#1d1d1d] shadow-[0_18px_28px_rgba(0,0,0,0.16)] before:absolute before:bottom-2 before:left-1/2 before:h-8 before:w-14 before:-translate-x-1/2 before:rounded-full before:bg-[radial-gradient(circle,#fff_0%,#f0f0f0_45%,#d8d8d8_68%,#9f9f9f_100%)]" />
    </div>
  );
}

function WhiteCylinder({ className = "" }: { className?: string }) {
  return (
    <div className={cn("relative h-44 w-24", className)}>
      <div className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 rounded-md bg-[#f7f7f7] shadow-[0_10px_18px_rgba(0,0,0,0.08)]" />
      <div className="absolute left-1/2 top-8 h-8 w-2.5 -translate-x-1/2 rounded-full bg-[#dedede]" />
      <div className="absolute bottom-0 left-1/2 h-28 w-18 -translate-x-1/2 rounded-[999px] bg-gradient-to-b from-[#ffffff] via-[#f2f2f2] to-[#dcdcdc] shadow-[0_18px_28px_rgba(0,0,0,0.08)] before:absolute before:bottom-2 before:left-1/2 before:h-8 before:w-14 before:-translate-x-1/2 before:rounded-full before:bg-[radial-gradient(circle,#fff_0%,#fefefe_45%,#ececec_68%,#d3d3d3_100%)]" />
    </div>
  );
}

export function ProductVisual({ variant, compact = false }: ProductVisualProps) {
  const stageClass = compact ? "h-[250px]" : "h-[290px]";

  if (variant === "round-duo") {
    return <div className={cn("relative overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff,#ececec_58%,#d8d8d8)]", stageClass)}><div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.08))]" /><div className="absolute left-[23%] top-[18%] h-7 w-16 rounded-lg bg-[#262626] shadow-[0_12px_18px_rgba(0,0,0,0.15)]" /><div className="absolute left-[31%] top-[24%] h-5 w-4 rounded-full bg-[#383838]" /><div className="absolute left-[19%] top-[28%] h-26 w-26 rounded-full bg-[linear-gradient(180deg,#595959,#242424)] shadow-[0_20px_28px_rgba(0,0,0,0.14)] before:absolute before:bottom-1 before:left-1/2 before:h-16 before:w-20 before:-translate-x-1/2 before:rounded-full before:bg-[radial-gradient(circle,#ffffff_0%,#f0f0f0_48%,#d8d8d8_72%,#a8a8a8_100%)]" /><div className="absolute right-[19%] top-[18%] h-7 w-16 rounded-lg bg-[#f7f7f7] shadow-[0_12px_18px_rgba(0,0,0,0.08)]" /><div className="absolute right-[27%] top-[24%] h-5 w-4 rounded-full bg-[#e6e6e6]" /><div className="absolute right-[15%] top-[28%] h-26 w-26 rounded-full bg-[linear-gradient(180deg,#ffffff,#e6e6e6)] shadow-[0_20px_28px_rgba(0,0,0,0.08)] before:absolute before:bottom-1 before:left-1/2 before:h-16 before:w-20 before:-translate-x-1/2 before:rounded-full before:bg-[radial-gradient(circle,#ffffff_0%,#fefefe_48%,#ececec_72%,#d0d0d0_100%)]" /></div>;
  }

  if (variant === "slim-duo") {
    return <div className={cn("relative overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff,#ececec_58%,#d8d8d8)]", stageClass)}><div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.08))]" /><div className="absolute left-[30%] top-[10%] h-8 w-8 rounded-md bg-[#1f1f1f] shadow-[0_10px_18px_rgba(0,0,0,0.16)]" /><div className="absolute left-[34%] top-[17%] h-22 w-2 rounded-full bg-[#323232]" /><div className="absolute left-[27%] top-[28%] h-34 w-16 rounded-[999px] bg-[linear-gradient(180deg,#444444,#191919)] shadow-[0_20px_28px_rgba(0,0,0,0.16)] after:absolute after:bottom-3 after:left-1/2 after:h-5 after:w-14 after:-translate-x-1/2 after:rounded-full after:border-2 after:border-white/90" /><div className="absolute right-[30%] top-[10%] h-8 w-8 rounded-md bg-[#ffffff] shadow-[0_10px_18px_rgba(0,0,0,0.08)]" /><div className="absolute right-[34%] top-[17%] h-22 w-2 rounded-full bg-[#d8d8d8]" /><div className="absolute right-[27%] top-[28%] h-34 w-16 rounded-[999px] bg-[linear-gradient(180deg,#ffffff,#e4e4e4)] shadow-[0_20px_28px_rgba(0,0,0,0.08)] after:absolute after:bottom-3 after:left-1/2 after:h-5 after:w-14 after:-translate-x-1/2 after:rounded-full after:border-2 after:border-white/90" /></div>;
  }

  if (variant === "bar-duo") {
    return <div className={cn("relative overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff,#ececec_58%,#d8d8d8)]", stageClass)}><div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.08))]" /><div className="absolute left-[18%] top-[28%] h-9 w-[56%] rotate-[-3deg] rounded-md bg-[linear-gradient(180deg,#2f2f2f,#151515)] shadow-[0_18px_30px_rgba(0,0,0,0.16)]" /><div className="absolute left-[28%] top-[48%] h-8 w-[48%] rotate-[-17deg] rounded-md bg-[linear-gradient(180deg,#ffffff,#e9e9e9)] shadow-[0_14px_22px_rgba(0,0,0,0.08)]" /><div className="absolute left-[30%] top-[50%] flex w-[43%] rotate-[-17deg] justify-between px-2">{Array.from({ length: 6 }).map((_, index) => <span key={index} className="h-4 w-5 rounded-sm bg-white shadow-[inset_0_-1px_2px_rgba(0,0,0,0.08)]" />)}</div></div>;
  }

  if (variant === "bar-single") {
    return <div className={cn("relative overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff,#ececec_58%,#d8d8d8)]", stageClass)}><div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.08))]" /><div className="absolute left-[18%] top-[44%] h-8 w-[64%] rotate-[-18deg] rounded-md bg-[linear-gradient(180deg,#1c1c1c,#000000)] shadow-[0_18px_30px_rgba(0,0,0,0.16)]" /><div className="absolute left-[24%] top-[34%] flex w-[52%] items-center justify-between px-2">{Array.from({ length: 8 }).map((_, index) => <span key={index} className="h-6 w-6 rounded-full bg-[radial-gradient(circle,#fff_0%,#f3f3f3_42%,#d0d0d0_70%,#696969_100%)] shadow-[0_6px_10px_rgba(0,0,0,0.12)]" />)}</div></div>;
  }

  if (variant === "arm-line") {
    return <div className={cn("relative overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff,#ececec_58%,#d8d8d8)]", stageClass)}><div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.08))]" /><div className="absolute left-[18%] top-[38%] h-5 w-[56%] rotate-[-22deg] rounded-sm bg-[linear-gradient(180deg,#262626,#0f0f0f)] shadow-[0_14px_22px_rgba(0,0,0,0.14)]" /><div className="absolute right-[18%] top-[48%] h-5 w-[42%] rotate-[22deg] rounded-sm bg-[linear-gradient(180deg,#262626,#0f0f0f)] shadow-[0_14px_22px_rgba(0,0,0,0.14)]" /></div>;
  }

  if (variant === "disc-pair") {
    return <div className={cn("relative overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff,#ececec_58%,#d8d8d8)]", stageClass)}><div className="absolute left-[17%] top-[12%] h-7 w-24 rotate-[-6deg] rounded-md bg-[#202020] shadow-[0_12px_18px_rgba(0,0,0,0.14)]" /><div className="absolute left-[26%] top-[18%] h-12 w-3 rotate-[20deg] rounded-full bg-[#2f2f2f]" /><div className="absolute left-[16%] top-[34%] h-30 w-24 rounded-[999px] bg-[linear-gradient(180deg,#464646,#1b1b1b)] shadow-[0_18px_30px_rgba(0,0,0,0.16)] after:absolute after:bottom-2 after:left-1/2 after:h-14 after:w-20 after:-translate-x-1/2 after:rounded-full after:bg-[radial-gradient(circle,#ffffff_0%,#f1f1f1_50%,#d4d4d4_76%,#969696_100%)]" /><div className="absolute right-[17%] top-[12%] h-7 w-24 rotate-[6deg] rounded-md bg-[#f7f7f7] shadow-[0_12px_18px_rgba(0,0,0,0.08)]" /><div className="absolute right-[26%] top-[18%] h-12 w-3 rotate-[-20deg] rounded-full bg-[#dedede]" /><div className="absolute right-[16%] top-[34%] h-30 w-24 rounded-[999px] bg-[linear-gradient(180deg,#ffffff,#ececec)] shadow-[0_18px_30px_rgba(0,0,0,0.08)] after:absolute after:bottom-2 after:left-1/2 after:h-14 after:w-20 after:-translate-x-1/2 after:rounded-full after:bg-[radial-gradient(circle,#ffffff_0%,#fafafa_50%,#e2e2e2_76%,#cfcfcf_100%)]" /></div>;
  }

  return <div className={cn("relative overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff,#ececec_58%,#d8d8d8)]", stageClass)}><div className="absolute inset-0 flex items-center justify-center gap-2"><Cylinder className="scale-90" /><WhiteCylinder className="scale-90" /></div></div>;
}
