import React, { useState } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Flex } from "./Flex";
import { Box } from "./Box";
import { Header, HeaderProps } from "./Header";
import { Navbar, NavbarProps } from "./Navbar";
import { Drawer } from "./Drawer";
import { useIsMobile } from "../utils/useMediaQuery";

export interface LayoutProps 
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  header?: HeaderProps;
  navbar?: NavbarProps;
  children: React.ReactNode;
  showNavbar?: boolean;
  showHeader?: boolean;
  design?: DesignProps;
  contentDesign?: DesignProps;
}

export const Layout: React.FC<LayoutProps> = ({
  header,
  navbar,
  children,
  showNavbar = true,
  showHeader = true,
  design,
  contentDesign,
  className,
  ...props
}) => {
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const containerDesign: DesignProps = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    bg: "color.bg.primary",
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const containerClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, containerClass);

  // Основной контейнер: Navbar + (Header + Content)
  const mainContainerDesign: DesignProps = {
    display: "flex",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    ...contentDesign,
  };

  // Правый контейнер: Header + Content (справа от Navbar)
  const rightContainerDesign: DesignProps = {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
  };

  // Область контента
  const contentAreaDesign: DesignProps = {
    flex: 1,
    bg: "color.bg.secondary",
    borderRadius: "radius.lg",
    padding: {
      base: 2,
      md: 3,
    },
    overflowY: "auto",
    margin: {
      base: 2,
      md: 3,
    },
    minWidth: 0,
    ...contentDesign,
  };

  const mainContainerClass = getDesignClass(mainContainerDesign);
  const rightContainerClass = getDesignClass(rightContainerDesign);
  const contentAreaClass = getDesignClass(contentAreaDesign);

  // Определяем, показывать ли navbar на мобильных (в Drawer) и на десктопе
  const shouldShowMobileDrawer = isMobile && showNavbar && navbar;
  const shouldShowDesktopNavbar = !isMobile && showNavbar && navbar;

  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setNavbarCollapsed(!navbarCollapsed);
    }
  };

  const handleMobileNavItemClick = (id?: string) => {
    // Закрываем drawer при клике на элемент навигации на мобильных
    if (isMobile && navbar?.onItemClick && id) {
      navbar.onItemClick(id);
      setMobileDrawerOpen(false);
    }
  };

  return (
    <Box
      className={finalClassName}
      design={mergedDesign}
      {...props}
    >
      {/* Основной контейнер: Navbar + (Header + Content) */}
      <Box
        className={mainContainerClass}
        design={mainContainerDesign}
      >
        {/* Десктоп Navbar (слева, на всю высоту) */}
        {shouldShowDesktopNavbar && (
          <Navbar 
            {...navbar} 
            collapsed={navbarCollapsed}
            logo={header?.logo}
            title={header?.title}
          />
        )}
        
        {/* Правый контейнер: Header + Content */}
        <Box
          className={rightContainerClass}
          design={rightContainerDesign}
          data-layout-content="true"
        >
          {/* Header */}
          {showHeader && (
            <Header
              {...header}
              onMenuToggle={handleMenuToggle}
              navbarCollapsed={navbarCollapsed}
            />
          )}
          
          {/* Основной контент */}
          <Box
            as="main"
            className={contentAreaClass}
            design={contentAreaDesign}
          >
            {children}
          </Box>
        </Box>
      </Box>

      {/* Мобильный Drawer для навигации */}
      {shouldShowMobileDrawer && (
        <Drawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          placement="left"
          title={header?.title || "Меню"}
          logo={header?.logo}
          closeOnBackdrop
          closeOnEscape
          width="280px"
        >
          <Navbar 
            {...navbar} 
            collapsed={false}
            onItemClick={handleMobileNavItemClick}
          />
        </Drawer>
      )}
    </Box>
  );
};
