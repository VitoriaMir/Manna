import Image from 'next/image'

export default function Logo({ size = "w-10 h-10", showText = true, className = "" }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Container */}
      <div className={`${size} flex items-center justify-center`}>
        <Image
          src="/images/manna-logo.png"
          alt="Manna Manhwa Logo"
          width={40}
          height={40}
          className="rounded-md object-contain"
          priority
        />
      </div>
      
      {/* Optional Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            MANNA
          </span>
          <span className="text-xs bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent -mt-1">
            MANHWA
          </span>
        </div>
      )}
    </div>
  )
}

// Variações do componente para diferentes usos
export function LogoIcon({ size = "w-10 h-10" }) {
  return (
    <div className={`${size} flex items-center justify-center`}>
      <Image
        src="/images/manna-logo.png"
        alt="Manna Manhwa"
        width={40}
        height={40}
        className="rounded-md object-contain"
        priority
      />
    </div>
  )
}

export function LogoFull({ className = "" }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <LogoIcon size="w-12 h-12" />
      <div className="flex flex-col">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
          MANNA
        </h1>
        <p className="text-sm bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent -mt-1">
          MANHWA COLLECTION
        </p>
      </div>
    </div>
  )
}
