"Resource/UI/IntroMenu.res"
{
	"intro"
	{
		"ControlName"		"CTFIntroMenu"
		"fieldName"		"intro"
		"xpos"			"0"
		"ypos"			"0"
		"wide"			"f0"
		"tall"			"480"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"0"
		"paintbackground"	"0"
	}

	"MainBG"
	{
		"ControlName"	"ImagePanel"
		"fieldName"		"MainBG"
		"xpos"			"0"
		"ypos"			"0"
		"zpos"			"1"
		"wide"			"f0"
		"tall"			"480"
		"fillcolor"		"HudBG"
		"visible"		"1"
		"enabled"		"1"
	}
	
	"titlelabel"
	{
		"ControlName"		"CExLabel"
		"fieldName"			"titlelabel"
		"xpos"				"0"
		"ypos"				"0"
		"wide"				"f0"
		"tall"				"70"
		"autoResize"		"0"
		"pinCorner"			"0"
		"visible"			"0"
		"enabled"			"0"
		"tabPosition"		"0"
	}

	"Skip"  
	{
		"ControlName"		"CExButton"
		"fieldName"		"Skip"
		"xpos"			"c4"
		"ypos"			"r39"
		"zpos"			"6"
		"wide"			"151"
		"tall"			"29"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"0"
		"labelText"		"#Button_SkipIntro"
		"textAlignment"		"east"
		"command"		"skip"
		"border_default"	""
		"border_armed"		""
		"paintbackground"	"0"
		"font"			"NoveMedium14"
		"fgcolor"		"MenuText"
		"defaultFgColor_override" "MenuText"
		"armedFgColor_override" "MenuTextArmed"
		"depressedFgColor_override" "MenuText"
	}

	"Continue"  
	{
		"ControlName"		"CExButton"
		"fieldName"		"Continue"
		"xpos"			"c4"
		"ypos"			"r39"
		"zpos"			"6"
		"wide"			"151"
		"tall"			"29"
		"visible"		"0"
		"enabled"		"1"
		"labelText"		"#TF_Continue"
		"textAlignment"		"east"
		"command"		"skip"
		"border_default"	""
		"border_armed"		""
		"paintbackground"	"0"
		"font"			"NoveMedium14"
		"fgcolor"		"MenuText"
		"defaultFgColor_override" "MenuText"
		"armedFgColor_override" "Garm3nArmedText"
		"depressedFgColor_override" "MenuText"
	}
	
	"Back"  
	{
		"ControlName"	"CExButton"
		"fieldName"		"Back"
		"xpos"			"c-155"
		"ypos"			"r39"
		"zpos"			"6"
		"wide"			"150"
		"tall"			"29"
		"visible"		"1"
		"enabled"		"1"
		"labelText"		"#TF_Back"
		"textAlignment"	"west"
		"command"		"back"
		"border_default"	""
		"border_armed"		""
		"paintbackground"	"0"
		"font"			"NoveMedium14"
		"fgcolor"		"MenuText"
		"defaultFgColor_override" "MenuText"
		"armedFgColor_override" "MenuTextArmed"
		"depressedFgColor_override" "MenuText"
	}

	"ReplayVideo" 
	{
		"ControlName"	"CExButton"
		"fieldName"		"ReplayVideo"
		"xpos"			"c-155"
		"ypos"			"r39"
		"zpos"			"6"
		"wide"			"150"
		"tall"			"29"
		"visible"		"0"
		"enabled"		"1"
		"labelText"		"#TF_ReplayIntro"
		"textAlignment"	"west"
		"command"		"replayVideo"
		"border_default"	""
		"border_armed"		""
		"paintbackground"	"0"
		"font"			"NoveMedium14"
		"fgcolor"		"MenuText"
		"defaultFgColor_override" "MenuText"
		"armedFgColor_override" "MenuTextArmed"
		"depressedFgColor_override" "MenuText"
	}
	
	"ShadedBar"
	{
		"ControlName"	"ImagePanel"
		"fieldName"		"ShadedBar"
		"xpos"			"0"
		"ypos"			"r47"
		"zpos"			"5"
		"wide"			"f0"
		"tall"			"47"
		"fillcolor"	    "MenuS"
		"visible"		"1"
		"enabled"		"1"
	}		
	
	"VideoPanel"
	{
		"ControlName"	"CTFVideoPanel"
		"fieldName"		"VideoPanel"
		"xpos"			"c-150"
		"ypos"			"r375"
		"zpos"			"3"		
		"wide"			"300"
		"tall"			"225"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"start_delay"	"1.0"
		"end_delay"		"2.0"
	}
	
	"MenuBG"
	{
		"ControlName"	"CModelPanel"
		"fieldName"		"MenuBG"
		"xpos"			"0"
		"ypos"			"0"
		"zpos"			"0"		
		"wide"			"f0"
		"tall"			"480"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"1"
		"fov"			"20"
		
		"model"
		{
			"modelname"	"models/vgui/UI_welcome01_screen.mdl"
			"skin"		"0"
			"angles_x" "0"
			"angles_y" "180"
			"angles_z" "0"
			"origin_x" "290"
			"origin_x_lodef" "320"
			"origin_x_hidef" "310"
			"origin_y" "0"
			"origin_z" "-39"
			
			"animation"
			{
				"name"			"Up"
				"sequence"		"screenup"
			}
			
			"animation"
			{
				"name"			"UpSlow"
				"sequence"		"screenup_slow"
			}
			
			"animation"
			{
				"name"			"Down"
				"sequence"		"screendown"
				"default"		"1"
			}
		}
	}					
	
	"VideoCaption"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"VideoCaption"
		"xpos"			"c-300"
		"ypos"			"r173"
		"zpos"			"6"
		"wide"			"600"
		"tall"			"70"
		"visible"		"0"
		"enabled"		"1"
		"labelText"		""
		"textAlignment"	"center"
		"font"			"NoveMedium9"
		"fgcolor"		"White"
	}
	
	"Footer" [$X360]
	{
		"ControlName"		"CTFFooter"
		"fieldName"			"Footer"
		"zpos"				"6"
		"tall"				"80"
		"button_separator"	"10"
		"button_separator_lodef"	"5"
		"buttongap"			"50"
		"textadjust"		"3"
		"buttonoffsety"		"20"
		"buttonoffsety_hidef"		"0"
		"buttonoffsety_lodef"		"18"
		"fonttext"			"MatchmakingDialogMenuLarge"
		"fonttext_lodef"			"MatchmakingDialogMenuSmall"
		"fgcolor"			"HudOffWhite" 	
		
		"button"
		{
			"name"		"intro"
			"text"		"#GameUI_Back"
			"icon"		"#GameUI_Icons_B_BUTTON"	
		}
		
		"button"
		{
			"name"		"continue"
			"text"		"#Button_SkipIntro_360"
			"icon"		"#GameUI_Icons_A_BUTTON"	
		}
	}	
}
