
import { Link, NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, PlusSquareIcon } from 'lucide-react'

const AdminSidebar = () => {
    const user = {
        firstName: 'Admin',
        LastName: 'User',
        imageUrl: assets.profile
    }
    const adminNavLinks=[
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboardIcon },
        { name: 'Add Shows', path: '/admin/add-shows', icon:PlusSquareIcon },
        { name: 'List Shows', path: '/admin/list-shows', icon: ListIcon },
        { name: 'List Bookings', path: '/admin/list-bookings', icon: ListCollapseIcon }
    ]
  return (
    
        <div className='h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-gray-300/20 text-sm '>
            <img src={user.imageUrl} className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto' alt="" />
            <p className='mt-2 text-base max-md:hidden'>
                {user.firstName} {user.LastName}
            </p>
            <div className='w-full'>
                {adminNavLinks.map((link, index) => (
                    <NavLink key={index} to={link.path} end className={({ isActive }) =>  `relative flex items-center max-md:justify-center gap-2 q-full py-2.5 min-md;pl-10 first:mt-6 text-gray-400 ${isActive && 'bg-[#F84565]/15 text-[#F84565] group'}`}>

                        {({ isActive }) => (   
                            <>
                                <link.icon className="w-5 h-5" />     
                                <p className='max-md:hidden'>
                                    {link.name} 
                                </p>
                                <span className={`w-1.5 h-10 rounded-l right-0 absolute ${isActive  && 'bg-[#F84565]'}`}>   

                                </span>

                            </>
                         )}

                        
                    </NavLink>


                
                ))}
            </div>
        </div>
    
  )
}

export default AdminSidebar
