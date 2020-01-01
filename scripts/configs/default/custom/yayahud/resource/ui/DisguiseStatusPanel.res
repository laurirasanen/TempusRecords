"Resource/UI/ItemModelPanel.res"
{
	"itemmodelpanel"
	{
		"ControlName"	"CEmbeddedItemModelPanel"
		"fieldName"		"itemmodelpanel"
		"wide"			"0"
		"tall"			"0"
		"visible"		"0"
		"enabled"		"0"
	}
	"DisguiseStatusLine"        //sep line
	{
		"ControlName"		"ImagePanel"
		"fieldName"		"DisguiseStatusLine"
		"xpos"			"c-320"
		"ypos"			"433"
		"zpos"			"-1"
		"wide"			"222"
		"tall"	 		"1"	
		"fillcolor"		"White"
		"visible"		"0"
		"enabled"		"1"
	}
    "DisguiseStatusBG"
	{
		"ControlName"		"CTFImagePanel"
		"fieldName"		"DisguiseStatusBG"
		"xpos"			"240"
		"ypos"			"446"  //446
        "zpos"          "24"
		"wide"			"9" //9
		"tall"			"9" //9
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"image"			"replay/thumbnails/bg_black"
		"scaleImage"		"1"
		"teambg_1"		"replay/thumbnails/bg_black"
		"teambg_2"		"replay/thumbnails/bg_redtri"
		"teambg_3"		"replay/thumbnails/bg_bluetri"
		
		"src_corner_height"		"23"	
		"src_corner_width"		"20"
			
		"draw_corner_width"		"0"				
		"draw_corner_height" 	"0"	
	}

	"DisguiseNamesBG"
	{
		"ControlName"		"ImagePanel"
		"fieldName"		"DisguiseNamesBG"
		"xpos"			"68"
		"ypos"			"434"
        "zpos"          "-4"
		"wide"			"180"
		"tall"			"20"
		"fillcolor"		"BrightGray"
		"visible"		"1"
		"enabled"		"1"
	}

	"DisguiseNameLabel"
	{	
		"ControlName"	"CExLabel"
		"fieldName"		"DisguiseNameLabel"
		"font"			"Medium12"
		"xpos"			"71"
		"ypos"			"433"
		"zpos"			"1"
		"wide"			"171"
		"tall"			"16"
		"visible"		"1"
		"enabled"		"1"
		"fgcolor"		"Black"
		"labelText"		"%disguisename%"
		"textAlignment"	"west"
	}
	
	"WeaponNameLabel"
	{	
		"ControlName"	"CExLabel"
		"fieldName"		"WeaponNameLabel"
		"font"			"NoveMedium8"
		"xpos"			"71"
		"ypos"			"443"
		"zpos"			"1"
		"wide"			"171"
		"tall"			"11"
		"visible"		"1"
		"enabled"		"1"
		"fgcolor"		"Black"
		"labelText"		"%weaponname%"
		"textAlignment"	"west"	
	}
	"WeaponNameLabelShadow"
	{	
		"ControlName"	"CExLabel"
		"fieldName"		"WeaponNameLabelShadow"
		"font"			"Medium10"
		"xpos"			"51"
		"ypos"			"443"
		"zpos"			"1"
		"wide"			"168"
		"tall"			"12"
		"visible"		"0"
		"enabled"		"0"
		"fgcolor"		"Blank"
		"labelText"		"%weaponname%"
		"textAlignment"	"west"	
	}
	
	"SpectatorGUIHealth"
	{
		"ControlName"		"EditablePanel"
		"fieldName"		"SpectatorGUIHealth"
		"xpos"			"22"
		"ypos"			"434"
		"wide"			"48"
		"tall"			"21"
		"visible"			"1"
		"enabled"			"1"	
		"HealthBonusPosAdj"	"10"
		"HealthDeathWarning"	"0.49"
		"TFFont"			"HudFontSmall"
		"HealthDeathWarningColor"	"HUDDeathWarning"
		"TextColor"		"HudOffWhite"
	}	
	
}
