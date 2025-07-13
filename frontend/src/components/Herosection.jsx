import React from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
const Herosection = () => {
    const navigate = useNavigate()
  return (
    <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen'>
        <img src={assets.marvelLogo} alt="" className='max-h-11 lg:h-11 mt-20'/>

        <h1 className='text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110'>Guardians <br/> of the Galaxy </h1>
        <div className='flex items-center gap-4 text-gray-300'>
            <span> 
                Action | Adventure | Sci-Fi 
            </span>
            <div className='flex items-center gap-1'>
                <CalendarIcon className='w-4.5 h-4.5' />2018
            </div>
            <div className='flex items-center gap-1'>   
                <ClockIcon className='w-4.5 h-4.5' /> 2h 8m
            </div>

        </div>
        <p className='max-w-md text-gray-300'>
            After stealing a mysterious orb in the far reaches of outer space, Peter Quill from Earth is now the main target of a manhunt led by the villainous Ronan. To evade Ronan, Quill is forced into an uneasy truce with four disparate misfits: gun-toting Rocket, tree-like humanoid Groot, enigmatic Gamora and vengeance-driven Drax the Destroyer. But when Quill discovers the true power of the orb and the threat it poses to the cosmos, he must rally his ragtag group to save the galaxy.
        </p>
        <button onClick={()=>navigate('/movies')} className='flex items-center gap-1 px-6 py-3 text-sm bg-[#F84565] hover:bg-[#D63854] transition rounded-full font-medium cursor-pointer'>
            Explore movies 
            <ArrowRight className='w-5 h-5' />
        </button>
      
    </div>
  )
}

export default Herosection
