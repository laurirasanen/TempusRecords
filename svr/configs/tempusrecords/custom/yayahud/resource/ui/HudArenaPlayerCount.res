"Resource/UI/HudArenaPlayerCount.res"
{
	"Blue"
	{
		"ControlName"	"EditablePanel"
		"fieldName"		"Blue"
		"xpos"			"0"
		"ypos"			"0"
		"zpos"			"0"
		"wide"			"60"
		"tall"			"18"
		"visible"		"1"	
		
		"count"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"count"
			"xpos"			"4"
			"ypos"			"0"
			"zpos"			"2"
			"wide"			"60"
			"tall"			"18"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"1"
			"enabled"		"1"
			"font"			"MediumNumbers20"
			"labelText"		"%blue_alive%"
			"textAlignment"	"west"
			"fgcolor"		"Blue"
		}	
	}

	"Red"
	{
		"ControlName"	"EditablePanel"
		"fieldName"		"Red"
		"xpos"			"0"
		"ypos"			"18"
		"zpos"			"0"
		"wide"			"60"
		"tall"			"18"
		"visible"		"1"
	
		"count"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"count"
			"xpos"			"4"
			"ypos"			"0"
			"zpos"			"2"
			"wide"			"60"
			"tall"			"18"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"1"
			"enabled"		"1"
			"font"			"MediumNumbers20"
			"labelText"		"%red_alive%"
			"textAlignment"	"west"
			"fgcolor"		"Red"
		}	
	}

	"PlayerIcon"
	{
		"ControlName"	"ImagePanel"
		"fieldName"		"PlayerIcon"
		"xpos"			"c-4"
		"ypos"			"2"
		"zpos"			"3"
		"wide"			"8"
		"tall"			"16"
		"visible"		"0"
		"enabled"		"1"
		"image"			"capture_icon_white"
		"scaleImage"	"1"
	}
}
