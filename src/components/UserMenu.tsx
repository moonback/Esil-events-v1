import React from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, Package, Heart, LogOut, ShieldCheck } from 'lucide-react';
import { User as UserType } from '@supabase/supabase-js';

interface UserMenuProps {
  user: UserType;
  isAdmin: boolean;
  onSignOut: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, isAdmin, onSignOut }) => {
  return (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 divide-y divide-gray-100">
      {/* En-tête du menu */}
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900">
          {user.email}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {isAdmin ? 'Administrateur' : 'Client'}
        </p>
      </div>

      {/* Menu principal */}
      <div className="py-2">
        <Link
          to="/account/profile"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <User className="w-4 h-4 mr-3" />
          Mon profil
        </Link>
        <Link
          to="/packages"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Package className="w-4 h-4 mr-3" />
          Packages
        </Link>
        <Link
          to="/account/orders"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Package className="w-4 h-4 mr-3" />
          Mes commandes
        </Link>
        <Link
          to="/account/wishlist"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Heart className="w-4 h-4 mr-3" />
          Ma liste d'envies
        </Link>
        <Link
          to="/account/settings"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-4 h-4 mr-3" />
          Paramètres
        </Link>
      </div>

      {/* Section admin */}
      {isAdmin && (
        <div className="py-2">
          <Link
            to="/admin/products"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 mr-3" />
            Administration
          </Link>
        </div>
      )}

      {/* Déconnexion */}
      <div className="py-2">
        <button
          onClick={onSignOut}
          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
