"Resource/UI/Scoreboard.res"
{
    "scores"
	{
		"ControlName"		"CTFClientScoreBoardDialog"
		"fieldName"		"scoreinfo"
		"xpos"			"0"
		"ypos"			"0"
		"zpos"			"1"
		"wide"			"f0"
		"tall"			"480"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"0"
		"tabPosition"		"0"
		"status_width"		"15"
		"nemesis_width"		"14"
		"class_width"		"15"
		"ping_width"		"99999"
		"score_width"		"99999"
		"avatar_width"		"54"
		"name_width"		"54"
	}
    
    "ServerTimeLeft" 
	{
		"ControlName"	"CExLabel"
		"fieldName"		"ServerTimeLeft"
		"font"			"MediumNumbers20"
		"font_minmode"		"MediumNumbers20"
		"labelText"		"%servertimeleft%"
		"textinsetx"	"-4"
		"textinsetx_minmode"	"-4"
		"use_proportional_insets" "1"
		"use_proportional_insets_minmode" "1"
		"textAlignment"	"west"
		"textAlignment_minmode"	"west"
		"fgcolor"			"White"
        "fgcolor_minmode"   "White"
		"xpos"			"4"
		"ypos"			"-1"
		"ypos_minmode"		"-1"
		"zpos"			"18"
		"wide"			"300"
		"wide_minmode"		"300"
		"tall"			"20"
		"tall_minmode"		"20"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
        
        if_mvm
        {
            "font"			"MediumNumbers10"
            "fgcolor"			"Black"
            "textinsetx"	"-2"
            "use_proportional_insets" "1"
            "ypos"			"r11"
            "xpos"			"c-293"
            "tall"			"11"
            "textAlignment"	"west"
            "visible" "1"
        }
	}
    "MvMTitle"
    {
        "ControlName"   "CExLabel"
        "fieldName"     "MvMTitle"
        "font"          "Heavy18"
        "labelText"     "MANN VS MACHINE"
        "textAlignment" "west"
        "xpos"          "c-292" 
        "ypos"          "c70" 
        "zpos"          "15"
        "wide"          "287"
        "tall"          "17"
        "visible"       "0"
        "enabled"       "1"
        "fgcolor"       "White"

        if_mvm
        {
            "visible" "1"
        }
    }  
    "ServerLabel"
    {
        "ControlName"   "CExLabel"
        "fieldName"     "ServerLabel"
        "font"          "NoveMedium10"
        "labelText"     "%server%"
        "textAlignment" "west"
        "textAlignment_minmode" "west"
        "textinsetx"	"-36"
        "textinsetx_minmode"	"-36"
		"use_proportional_insets" "1"
        "xpos"          "4"  
        "xpos_minmode"          "4"  
        "ypos"          "15" 
        "zpos"          "4"
        
        "wide"          "378"
        "tall"          "15"
        "visible"       "1"
        "enabled"       "1"
        "fgcolor"       "White"

        if_mvm
        {
            "visible" "0"
        }
    }
    "Spectators"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"Spectators"
		"font"			"Light12"
		"labelText"		"%spectators%"
		"fgcolor"			"White"
		"textAlignment"	"north-west"
		"xpos"			"4"
		"ypos"			"26"
		"zpos"			"4"
		"wide"			"360"
		"tall"			"82"
		"visible"		"1"
		"enabled"		"1"
		"wrap"			"1"
	}	
	"SpectatorsInQueue"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"SpectatorsInQueue"
		"font"			"Light12"
		"fgcolor"			"White"
		"labelText"		"%waitingtoplay%"
		"textAlignment"	"south-west"
		"xpos"			"3"
		"ypos"			"r85"
		"zpos"			"4"
		"wide"			"140"
		"tall"			"82"
		"visible"		"1"
		"enabled"		"1"
		"wrap"			"1"
	}
	"MainBG"
	{
		"ControlName"	"ImagePanel"
		"fieldName"		"MainBG"
		"xpos"			"c-228"
		"ypos"			"c53"
		"ypos_minmode"		"r125"
		"zpos"			"-2"
		"wide"			"456"
		"tall"			"240"
		"tall_minmode"		"190"
		"fillcolor"		"DarkGray"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"1"

		if_mvm
		{
            "fillcolor"		"DarkGray"
			"xpos"			"c-295"
			"ypos"			"c87"
			"wide"			"590"
			"tall"			"169"
            "visible"		"1"
		}
	}
    "InfoBG"
	{
		"ControlName"	"ImagePanel"
		"fieldName"		"InfoBG"
		"xpos"			"c-228"
		"ypos"			"r30"
		"ypos_minmode"		"r30"
		"zpos"			"2"
		"wide"			"456"
		"tall"			"30"
		"fillcolor"		"BrightGray"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"1"

		if_mvm
		{
            "xpos"			"c-295"
            "ypos"          "r10"
            "wide"			"590"
            "visible"       "1"
		}
	}
	"MvMBGTopLine"
	{
		"ControlName"	"ImagePanel"
		"fieldName"		"MvMBGTopLine"
		"xpos"			"c-295"
		"ypos"			"c85"
		"zpos"			"14"
		"wide"			"410"
		"tall"			"2"
		"fillcolor"		"Red"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"1"

		if_mvm
		{
			"visible"			"1"
		}
	}
    "MvMBGTop"
	{
		"ControlName"	"ImagePanel"
		"fieldName"		"MvMBGTop"
		"xpos"			"c-295"
		"ypos"			"c70"
		"zpos"			"9"
		"wide"			"590"
		"tall"			"17"
		"fillcolor"		"Red"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"1"

		if_mvm
		{
			"visible"			"1"
		}
	}
	"BlueLabelBG"
	{
		"ControlName"		"ImagePanel"
		"fieldName"		"BlueLabelBG"
		"xpos"			"C-148"
		"ypos"			"195"
		"zpos"			"21"
		"wide"			"121"
		"tall"			"17"
		"visible"		"1"
		"enabled"		"1"
		"fillcolor"		"Blue"

		if_mvm
		{
			"visible"		"0"
		}
	}
	"BlueTeamLabel"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"BlueTeamLabel"
		"font"			"HeavyCaps18"
		"labelText"		"%blueteamname%"
		"fgcolor"		"White"
		"textAlignment"	"west"
		"xpos"			"C-145"
		"ypos"			"186"
		"wide"			"70"
		"tall"			"34"
		"zpos"			"22"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"

		if_mvm
		{
			"visible"		"0"
		}
	}							
	"BlueTeamScore"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"BlueTeamScore"
		"font"			"MediumNumbers18"
		"labelText"		"%blueteamscore%"
		"fgcolor"		"White"
		"textAlignment"	"east"
		"xpos"			"C-76"
		"ypos"			"185"
		"wide"			"46"
		"tall"			"33"
		"zpos"			"22"
		"visible"		"1"
		"enabled"		"1"

		if_mvm
		{
			"visible"		"0"
		}
	}
	"BlueTeamPlayerCount"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"BlueTeamPlayerCount"
		"font"			"MediumNumbers10"
		"labelText"		"%blueteamplayercount%"
		"fgcolor"		"Blue"
		"textAlignment"	"west"
		"xpos"			"2"
		"ypos"			"r11"
        "zpos" "4"
		"wide"			"60"
		"tall"			"11"
		"visible"		"1"
		"enabled"		"1"

		if_mvm
		{
			"visible"		"0"
		}
	}
	"RedTeamLabelBG"
	{
		"ControlName"		"ImagePanel"
		"fieldName"		"RedTeamLabelBG"
		"xpos"			"c23"
		"ypos"			"195"
		"zpos"			"21"
		"wide"			"120"
		"tall"			"17"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"fillcolor"		"Red"
		if_mvm
		{
			"visible" "0"
		}
	}
	"RedTeamLabel"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"RedTeamLabel"
		"font"			"HeavyCaps18"
		"labelText"		"%redteamname%"
		"fgcolor"		"White"
		"textAlignment"	"east"
		"xpos"			"C22"
		"ypos"			"186"
		"wide"			"118"
		"tall"			"34"
		"zpos"			"22"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"

		if_mvm
		{
			"visible"		"0"
		}
	}							
	"RedTeamScore"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"RedTeamScore"
		"font"		    "NoveMedium18"
		"labelText"		"%redteamscore%"
		"fgcolor"		"White"
		"textAlignment"	"west"
		"xpos"			"C26"
		"ypos"			"185"
		"wide"			"118"
		"tall"			"33"
		"zpos"			"22"
		"visible"		"1"
		"enabled"		"1"

		if_mvm
		{
			"visible"		"0"
		}
	}
	"RedTeamPlayerCount"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"RedTeamPlayerCount"
		"font"			"MediumNumbers10"
		"labelText"		"%redteamplayercount%"
		"fgcolor"		"Red"
		"textAlignment"	"east"
		"xpos"			"-18"
		"ypos"			"r11"
        "zpos" "4"
		"wide"			"58"
		"tall"			"11"
		"visible"		"1"
		"enabled"		"1"

		if_mvm
		{
			"visible"		"0"
		}
	}
    "PlayersVs"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"PlayersVs"
		"font"			"NoveMedium8"
		"labelText"		"vs"
		"fgcolor"		"White"
		"textAlignment"	"center"
		"xpos"			"-8"
		"ypos"			"r11"
        "zpos" "4"
		"wide"			"57"
		"tall"			"11"
		"visible"		"1"
		"enabled"		"1"

		if_mvm
		{
			"visible"		"0"
		}
	}
	"BluePlayerList"
	{
		"ControlName"	"SectionedListPanel"
		"fieldName"		"BluePlayerList"
		"xpos"			"C-150"
		"ypos"			"200"
		"wide"			"125.5"
		"tall"			"204"
		"tall_minmode"	"204"
		"zpos"			"4"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"	"0"
		"autoresize"	"3"
		"linespacing"	"12"
		"fgcolor"		"blue"
	}
	"RedPlayerList"
	{
		"ControlName"	"SectionedListPanel"
		"fieldName"		"RedPlayerList"
		"xpos"			"c20"
		"ypos"			"200"
		"wide"			"125"
		"tall"			"204"
		"tall_minmode"	"204"
		"zpos"			"4"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"	"0"
		"autoresize"	"3"
		"linespacing"	"12"
		"textcolor"		"red"
	}
	"VerticalLine"
	{
		"ControlName"	"ImagePanel"
		"fieldName"		"VerticalLine"
		"wide"			"0"
		"tall"			"0"
		"visible"		"0"
		"enabled"		"0"

		if_mvm
		{
			"visible"		"0"
		}
	}			
	"ShadedBar" 
	{
		"ControlName"	"ImagePanel"
		"fieldName"		"ShadedBar"
		"xpos"			"10"
		"xpos_hidef"	"30"
		"ypos"			"372"	[$WIN32]
		"ypos"			"297"	[$X360]
		"zpos"			"2"
		"wide"			"580"
		"wide_lodef"	"539"
		"wide_hidef"	"559"
		"tall"			"70"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"1"
		"tabPosition"	"0"	
		"fillcolor"		"0 0 0 153"
		"PaintBackgroundType"	"0"

		if_mvm
		{
			"visible"		"0"
		}
	}
	"ClassImage"
	{
		"ControlName"		"ImagePanel"
		"fieldName"		"ClassImage"
		"xpos"			"22"
		"xpos_lodef"	"12"
		"ypos"			"350"	[$WIN32]
		"ypos"			"275"	[$X360]
		"zpos"			"3"
		"wide"			"0"
		"tall"			"0"
		"visible"		"0"
		"enabled"		"1"
		"image"			"../hud/class_scoutred"
		"scaleImage"		"1"	
		
		if_mvm
		{
			"visible"		"0"
			"wide"		"0"
			"tall"		"0"
		}
	}
	"PlayerNameLabel"
	{
		"ControlName"		"CExLabel"
		"fieldName"		"PlayerNameLabel"
		"font"			"ScoreboardMedium"
		"labelText"		"%playername%"
		"textAlignment"		"west"
		"xpos"			"115"
		"xpos_lodef"	"105"
		"ypos"			"377"	[$WIN32]
		"ypos"			"302"	[$X360]
		"zpos"			"3"
		"wide"			"325"	[$WIN32]
		"wide"			"410"	[$X360]
		"tall"			"20"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"1"
		
		if_mvm
		{
			"visible"		"0"
		}
	}							
	"HorizontalLine"
	{
		"ControlName"	"ImagePanel"
		"fieldName"		"HorizontalLine"
		"wide"			"0"
		"tall"			"0"
		"fillcolor"		"White"
		"visible"		"1"
		"enabled"		"1"

		if_mvm
		{
			"visible"		"0"
		}
	}
	"PlayerScoreLabel"
	{
		"ControlName"		"CExLabel"
		"fieldName"		"PlayerScoreLabel"
		"font"		"Garm3n20"
		"labelText"		"%playerscore%"
		"textAlignment"	"west"
		"fgcolor"		"White"
		"xpos"			"c-270"
		"ypos"			"r115"	
		"zpos"			"3"
		"wide"			"140"
		"tall"			"20"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"1"

		if_mvm
		{
			"visible"		"0"
		}
	}

	"LocalPlayerDuelStatsPanel"
	{
		"ControlName"	"EditablePanel"
		"fieldName"		"LocalPlayerDuelStatsPanel"
		"xpos"			"c-228"
		"ypos"			"r31"
		"zpos"			"5"
		"wide"			"456"
		"tall"			"32"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"border"		"NoBorder"

		if_mvm
		{
			"visible"		"0"
		}

		"DuelingLabel"
		{
			"wide"			"0"
			"tall"			"0"
			"visible"		"0"
			"enabled"		"0"
		}
        "VSLabel"
        {
            "ControlName"   "CExLabel"
            "fieldName"     "VSLabel"
            "font"          "NoveMedium10"
            "labelText"     "VS"
            "textAlignment" "center"
            "xpos"          "0"  
            "xpos_minmode"          "0"  
            "ypos"          "0" 
            "zpos"          "12"
            
            "wide"          "456"
            "tall"          "32"
            "visible"       "1"
            "enabled"       "1"
            "fgcolor"       "White"

            if_mvm
            {
                "visible" "0"
            }
        }
		"DuelingIcon"
		{
			"ControlName"	"ImagePanel"
			"fieldName"		"DuelingIcon"
			"xpos"			"212"
			"ypos"			"0"
			"zpos"			"2"
			"wide"			"0"
			"tall"			"0"
			"visible"		"1"
			"enabled"		"1"
			"image"			"../backpack/player/items/crafting/icon_dueling"
			"scaleImage"	"1"
		}

		"LocalPlayerData"
		{
			"ControlName"		"EditablePanel"
			"fieldName"		"LocalPlayerData"
			"xpos"			"0"
			"ypos"			"0"
			"wide"			"456"
			"tall"			"32"
			"visible"		"1"
			"enabled"		"1"
	
			"AvatarBGPanel"
			{
				"ControlName"	"EditablePanel"
				"fieldName"		"AvatarBGPanel"
				"xpos"			"-2"
				"ypos"			"-2"
				"zpos"			"4"
				"wide"			"500"
				"tall"			"40"
				"enabled"		"1"
				"PaintBackgroundType"	"2"
				"bgcolor_override"	"BrightGray"
			}
			"AvatarImage"	
			{
				"ControlName"	"CAvatarImagePanel"
				"fieldName"		"AvatarImage"
				"xpos"			"194"
				"ypos"			"7"
				"zpos"			"7"
				"wide"			"20"
				"tall"			"20"
				"visible"		"1"
				"enabled"		"1"
				"image"			""
				"scaleImage"	"1"	
				"color_outline"	"52 48 45 255"
			}
			"AvatarTextLabel"
			{	
				"ControlName"	"CExLabel"
				"fieldName"		"AvatarTextLabel"
				"fgcolor"		"Black"
				"xpos"			"61"
				"ypos"			"0"
				"zpos"			"7"
				"wide"			"126"
				"tall"			"32"
				"visible"		"1"
				"enabled"		"1"
				"labelText"		"%playername%"
				"textAlignment"	"east"
				"font"			"Heavy18"
			}
			"Score"
			{
				"ControlName"	"CExLabel"
				"fieldName"		"Score"
				"labelText"		"%score%"
				"textAlignment"	"west"
				"xpos"			"8"
				"ypos"			"0"
				"zpos"			"7"
				"wide"			"90"
				"tall"			"32"
				"visible"		"1"
				"enabled"		"1"
				"fgcolor"		"Black"
				"font"			"NoveMedium18"
			}
		}

		"OpponentData"
		{
			"ControlName"		"EditablePanel"
			"fieldName"		"OpponentData"
			"xpos"			"228"
			"ypos"			"0"
			"wide"			"228"
			"tall"			"32"
			"visible"		"1"
			"enabled"		"1"
	
			"AvatarBGPanel"
			{
				"ControlName"	"EditablePanel"
				"fieldName"		"AvatarBGPanel"
				"xpos"			"0"
				"ypos"			"15"
				"zpos"			"7"
				"wide"			"25"
				"tall"			"25"
				"visible"		"1"
				"PaintBackgroundType"	"2"
				"bgcolor_override"	"117 107 94 0"
			}
			"AvatarImage"
			{
				"ControlName"	"CAvatarImagePanel"
				"fieldName"		"AvatarImage"
				"xpos"			"18"
				"ypos"			"7"
				"zpos"			"7"
				"wide"			"20"
				"tall"			"20"
				"visible"		"1"
				"enabled"		"1"
				"image"			""
				"scaleImage"	"1"	
				"color_outline"	"52 48 45 255"
			}
			"AvatarTextLabel"
			{	
				"ControlName"	"CExLabel"
				"fieldName"		"AvatarTextLabel"
				"fgcolor"		"Black"
				"xpos"			"44"
				"ypos"			"0"
				"zpos"			"7"
				"wide"			"126"
				"tall"			"32"
				"visible"		"1"
				"enabled"		"1"
				"labelText"		"%playername%"
				"textAlignment"	"west"
				"font"			"Heavy18"
			}
			"Score"
			{
				"ControlName"	"CExLabel"
				"fieldName"		"Score"
				"labelText"		"%score%"
				"textAlignment"	"east"
				"xpos"			"130"
				"ypos"			"0"
				"zpos"			"7"
				"wide"			"90"
				"tall"			"32"
				"visible"		"1"
				"enabled"		"1"
				"fgcolor"		"Black"
				"font"			"NoveMedium18"
			}
		}		
	}

	"LocalPlayerStatsPanel"
	{
		"ControlName"		"EditablePanel"
		"fieldName"		"LocalPlayerStatsPanel"
		"xpos"			"0"
		"ypos"			"9990"
		"zpos"			"16"
		"wide"			"f0"
		"tall"			"480"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"0"
		"border"		"0"

		if_mvm
		{
			"ypos"		"99999"
		}
		"KillsLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"KillsLabel"
			"font"			"NoveMedium10"
			"labelText"		"Kills:"
			"fgcolor"		"Blank"
			"textAlignment"		"west"
			"xpos"			"c-227"
			"ypos"			"r11"
			"zpos"			"10"
			"wide"			"162"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"visible"		"0"
			}
		}
		"Kills"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Kills"
			"font"			"NoveMedium24"
			"labelText"		"%kills%"
			"textAlignment"	"east"
			"xpos"			"c-235"
			"ypos"			"r31"
			"zpos"			"3"
			"wide"			"50"
			"tall"			"26"
			"fgcolor"		"Black"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
                "fgcolor"		"Black"
                "textAlignment"	"east"
				"font"		"NoveMedium54"
				"xpos"		"c-323"
				"ypos"		"r170"
				"wide"		"140"
				"tall"		"54"
			}
		}
		"DeathsLabel"
		{
			"ControlName"		"CExLabel"
			"fieldName"		"DeathsLabel"
			"font"			"NoveMedium24"
			"labelText"		":"
			"fgcolor"		"Black"
			"textAlignment"		"west"
			"xpos"			"c-184"
			"ypos"			"r34"
			"zpos"			"3"
			"wide"			"162"
			"tall"			"30"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"visible"		"0"
			}
		}
		"Deaths"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Deaths"
			"font"			"NoveMedium24"
			"labelText"		"%deaths%"
			"textAlignment"	"west"
			"xpos"			"c-177"
			"ypos"			"r31"
			"zpos"			"3"
			"wide"			"115"
			"tall"			"26"
			"fgcolor"		"Black"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
                "textAlignment"		"west"
                "fgcolor"		"Black"
				"font"		"NoveMedium54"
				"xpos"		"c-176"
				"ypos"		"r170"
				"tall"		"54"
			}
		}
		"AssistsLabel"
		{
			"ControlName"		"CExLabel"
			"fieldName"		"AssistsLabel"
			"font"			"NoveMedium8"
			"labelText"		"Assists:"
			"fgcolor"		"Black"
			"textAlignment"		"east"
			"xpos"			"c-185"
			"ypos"			"r29"
			"zpos"			"3"
			"wide"			"80"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{   
                "textAlignment"		"west"
                "fgcolor"		"Black"
                "tall"			"15"
				"font"		"Medium9"
				"xpos"		"c-70"
				"ypos"		"r172"
			}
		}
		"Assists"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Assists"
			"font"			"NoveMedium8"
			"labelText"		"%assists%"
			"fgcolor"		"Black"
			"textAlignment"	"west"
			"xpos"			"c-103"
			"ypos"			"r29"
			"zpos"			"3"
			"wide"			"163"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
                "textAlignment"		"east"
                "fgcolor"		"Black"
                "tall"			"15"
				"font"		"Medium9"
				"xpos"		"c-61"
				"ypos"		"r172"
			}
		}
		"CapturesLabel"
		{
			"ControlName"		"CExLabel"
			"fieldName"		"CapturesLabel"
			"font"			"NoveMedium8"
			"labelText"		"Caps:"
			"fgcolor"		"Black"
			"textAlignment"		"east"
			"xpos"			"c-185"
			"ypos"			"r21"
			"zpos"			"3"
			"wide"			"80"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
                "fgcolor"		"Black"
                "tall"			"15"
				"font"		"Medium9"
				"xpos"		"c-70"
				"ypos"		"r162"
			}
		}
		"Captures"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Captures"
			"font"			"NoveMedium8"
			"labelText"		"%captures%"
			"fgcolor"		"Black"
			"textAlignment"	"west"
			"xpos"			"c-103"
			"ypos"			"r21"
			"zpos"			"3"
			"wide"			"163"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
                "fgcolor"		"Black"
                "textAlignment"	"east"
				"font"		"Medium9"
				"xpos"		"c-61"
				"ypos"		"r162"
                "tall"			"15"
			}
		}
		"DefensesLabel"
		{
			"ControlName"		"CExLabel"
			"fieldName"		"DefensesLabel"
			"font"			"NoveMedium8"
			"labelText"		"Defenses:"
			"fgcolor"		"Black"
			"textAlignment"		"east"
			"xpos"			"c-185"
			"ypos"			"r13"
			"zpos"			"3"
			"wide"			"80"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c-70"
				"ypos"		"r152"
			}
		}
		"Defenses"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Defenses"
			"font"			"NoveMedium8"
			"labelText"		"%defenses%"
			"fgcolor"		"Black"
			"textAlignment"	"west"
			"xpos"			"c-103"
			"ypos"			"r13"
			"zpos"			"3"
			"wide"			"163"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c-61"
				"ypos"		"r152"
			}
		}
		"DominationLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"DominationLabel"
			"font"			"NoveMedium8"
			"labelText"		"Dominations:"
			"fgcolor"		"Black"
			"textAlignment"		"east"
			"xpos"			"c-105"
			"ypos"			"r21"
			"zpos"			"3"
			"wide"			"80"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c-70"
				"ypos"		"r142"
			}
		}
		"Domination"
		{
			"ControlName"		"CExLabel"
			"fieldName"		"Domination"
			"font"			"NoveMedium8"
			"labelText"		"%dominations%"
			"fgcolor"		"Black"
			"textAlignment"	"west"
			"xpos"			"c-23"
			"ypos"			"r21"
			"zpos"			"3"
			"wide"			"163"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c-61"
				"ypos"		"r142"
			}
		}
		"RevengeLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"RevengeLabel"
			"font"			"NoveMedium8"
			"labelText"		"Revenges:"
			"fgcolor"		"Black"
			"textAlignment"		"east"
			"xpos"			"c-105"
			"ypos"			"r13"
			"zpos"			"3"
			"wide"			"80"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c-70"
				"ypos"		"r132"
			}
		}
		"Revenge"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Revenge"
			"font"			"NoveMedium8"
			"labelText"		"%Revenge%"
			"fgcolor"		"Black"
			"textAlignment"	"west"
			"xpos"			"c-23"
			"ypos"			"r13"
			"zpos"			"3"
			"wide"			"163"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c-61"
				"ypos"		"r132"
			}
		}
		"DestructionLabel"
		{
			"ControlName"		"CExLabel"
			"fieldName"		"DestructionLabel"
			"font"			"NoveMedium8"
			"labelText"		"Destructions:"
			"fgcolor"		"Black"
			"textAlignment"		"east"
			"xpos"			"c-105"
			"ypos"			"r29"
			"zpos"			"3"
			"wide"			"80"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c-70"
				"ypos"		"r122"
			}
		}
		"Destruction"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Destruction"
			"font"			"NoveMedium8"
			"labelText"		"%destruction%"
			"fgcolor"		"Black"
			"textAlignment"	"west"
			"xpos"			"c-23"
			"ypos"			"r29"
			"zpos"			"3"
			"wide"			"163"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c-61"
				"ypos"		"r122"
			}
		}
		"HealingLabel"
		{
			"ControlName"		"CExLabel"
			"fieldName"		"HealingLabel"
			"font"			"NoveMedium8"
			"labelText"		"Healing:"
			"fgcolor"		"Black"
			"textAlignment"		"east"
			"xpos"			"c35"
			"ypos"			"r29"
			"zpos"			"3"
			"wide"			"80"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c118"
				"ypos"		"r172"
			}
		}		
		"Healing"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Healing"
			"font"			"NoveMedium8"
			"labelText"		"%healing%"
			"fgcolor"		"Black"
			"textAlignment"	"west"
			"xpos"			"c117"
			"ypos"			"r29"
			"zpos"			"3"
			"wide"			"163"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c128"
				"ypos"		"r172"
				"wide"		"163"
			}
		}
		"InvulnLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"InvulnLabel"
			"font"			"NoveMedium8"
			"labelText"		"Ubers:"
			"fgcolor"		"Black"
			"textAlignment"		"east"
			"xpos"			"c35"
			"ypos"			"r21"
			"zpos"			"3"
			"wide"			"80"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c118"
				"ypos"		"r162"
			}
		}
		"Invuln"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Invuln"
			"font"			"NoveMedium8"
			"labelText"		"%invulns%"
			"fgcolor"		"Black"
			"textAlignment"	"west"
			"xpos"			"c117"
			"ypos"			"r21"
			"zpos"			"3"
			"wide"			"163"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c128"
				"ypos"		"r162"
				"wide"		"163"
			}
		}
		"HeadshotsLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"HeadshotsLabel"
			"font"			"NoveMedium8"
			"labelText"		"Headshots:"
			"fgcolor"		"Black"
			"textAlignment"		"east"
			"xpos"			"c-30"
			"ypos"			"r21"
			"zpos"			"3"
			"wide"			"80"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c118"
				"ypos"		"r152"
			}
		}
		"Headshots"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Headshots"
			"font"			"NoveMedium8"
			"labelText"		"%headshots%"
			"fgcolor"		"Black"
			"textAlignment"	"west"
			"xpos"			"c52"
			"ypos"			"r21"
			"zpos"			"3"
			"wide"			"163"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c128"
				"ypos"		"r152"
				"wide"		"163"
			}
		}
		"BackstabsLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"BackstabsLabel"
			"font"			"NoveMedium8"
			"labelText"		"Backstabs:"
			"fgcolor"		"Black"
			"textAlignment"		"east"
			"xpos"			"c-30"
			"ypos"			"r29"
			"zpos"			"3"
			"wide"			"80"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c118"
				"ypos"		"r142"
			}
		}
		"Backstabs"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Backstabs"
			"font"			"NoveMedium8"
			"labelText"		"%backstabs%"
			"fgcolor"		"Black"
			"textAlignment"	"west"
			"xpos"			"c52"
			"ypos"			"r29"
			"zpos"			"3"
			"wide"			"163"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c128"
				"ypos"		"r142"
				"wide"		"163"
			}
		}
		"TeleportsLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"TeleportsLabel"
			"font"			"NoveMedium8"
			"labelText"		"Teleports:"
			"fgcolor"		"Black"
			"textAlignment"		"east"
			"xpos"			"c-30"
			"ypos"			"r13"
			"zpos"			"3"
			"wide"			"80"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c118"
				"ypos"		"r132"
			}
		}
		"Teleports"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Teleports"
			"font"			"NoveMedium8"
			"labelText"		"%teleports%"
			"fgcolor"		"Black"
			"textAlignment"	"west"
			"xpos"			"c52"
			"ypos"			"r13"
			"zpos"			"3"
			"wide"			"163"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c128"
				"ypos"		"r132"
				"wide"		"163"
			}
		}
		"BonusLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"BonusLabel"
			"font"			"NoveMedium8"
			"labelText"		"Bonus:"
			"fgcolor"		"Black"
			"textAlignment"		"east"
			"xpos"			"c35"
			"ypos"			"r13"
			"zpos"			"3"
			"wide"			"80"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c118"
				"ypos"		"r122"
			}
		}
		"Bonus"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"Bonus"
			"font"			"NoveMedium8"
			"labelText"		"%bonus%"
			"fgcolor"		"Black"
			"textAlignment"	"west"
			"xpos"			"c117"
			"ypos"			"r13"
			"zpos"			"3"
			"wide"			"163"
			"tall"			"11"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"font"		"Medium9"
				"xpos"		"c128"
				"ypos"		"r122"
				"wide"		"163"
			}
		}
		"StatsBG"
		{
			"ControlName"	"ImagePanel"
			"fieldName"		"StatsBG"
			"xpos"			"r368"
			"xpos_minmode"		"r233"
			"ypos"			"9999"
			"zpos"			"-3"
			"wide"			"135"
			"wide_minmode"		"233"
			"tall"			"170"
			"tall_minmode"		"86"
			"fillcolor"		"BrightGray"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"1"
			"enabled"		"1"

			if_mvm
			{
				"xpos"		"c-295"
				"ypos"		"r172"
				"wide"		"590"
				"tall"		"67"
			}
		}
		"StatsBGRight"
		{
			"ControlName"	"ImagePanel"
			"fieldName"		"StatsBGRight"
			"xpos"			"c88"
			"ypos"			"9999"
			"zpos"			"-3"
			"wide"			"167"
			"tall"			"68"
			"fillcolor"		"BrightGray"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"0"
			"visible_minmode"	"0"
			"enabled"		"1"

			if_mvm
			{
				"xpos"		"c111"
				"ypos"		"r172"
				"wide"		"185"
				"tall"		"67"
				"visible"		"0"
			}
		}
		"Versus"
		{
			"controlName"	"CExLabel"
			"fieldName"	 	"Versus"
			"visible"		"1"
			"enabled"		"1"
			"zpos"			"1"
			"xpos"			"r368"
			"xpos_minmode"		"r188"
			"ypos"			"9999"
			"wide"			"135"
			"wide_minmode"		"28"
			"tall"			"27"
			"tall_minmode"		"25"
			"font"			"Medium26"
			"font_minmode"		"Medium24"
			"labelText"		":"
			"fgcolor"		"Blank"
			"textAlignment"	"center"

			if_mvm
			{
				"font"		"Medium44"
				"xpos"		"c-192"
				"ypos"		"r168"
				"wide"		"26"
				"tall"		"53"
			}
		}
		"MapName"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"mapname"
			"font"			"NoveMedium10"
			"labelText"		"%mapname%"
			"textAlignment" 	"center"
			"xpos"			"c151"
			"ypos"			"r25"
			"zpos"			"3"
			"wide"			"71"
			"tall"			"11"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"1"
			"enabled"		"1"
			"fgcolor"		"Black"

			if_mvm
			{
				"font"			"NoveMedium18"
                "textAlignment" 	"east"
				"xpos"			"c21"
                "ypos"			"r368"
                "zpos"          "15"
                "wide"			"270"
                "tall"			"18"
                "fgcolor"		"Black"
			}	
		}
		"GameType"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"gametype"
			"font"			"NoveMedium8"
			"labelText"		"%gametype%"
			"textAlignment" 	"center"
			"xpos"			"c151"
			"ypos"			"r16"
			"zpos"			"3"
			"wide"			"71"
			"tall"			"11"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"1"
			"enabled"		"1"
			"fgcolor"		"Black"
		}
	}

	"ButtonLegendBG"		[$X360]
	{
		"ControlName"	"ImagePanel"
		"fieldName"		"ButtonLegendBG"
		"xpos"			"10"
		"xpos_hidef"	"30"
		"ypos"			"373"
		"zpos"			"0"
		"wide"			"539"
		"wide_hidef"	"559"
		"tall"			"38"
		"autoResize"	"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"	"0"	
		"fillcolor"		"0 0 0 153"
		"PaintBackgroundType"	"0"
	}
	
	"ButtonLegend"		[$X360]
	{
		"ControlName"	"EditablePanel"
		"fieldName"		"ButtonLegend"
		"xpos"			"10"
		"xpos_hidef"	"35"
		"ypos"			"373"
		"zpos"			"1"
		"wide"			"539"
		"wide_hidef"	"595"
		"tall"			"150"
		"visible"		"1"
										
		"SelectHintIcon"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"SelectHintIcon"
			"font"			"GameUIButtons"
			"xpos"			"10"
			"xpos_hidef"	"0"
			"ypos"			"0"
			"zpos"			"1"
			"wide"			"300"
			"tall"			"38"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"1"
			"enabled"		"1"
			"labelText"		"C"
			"textAlignment"	"Left"
			"dulltext"		"0"
			"brighttext"	"0"
		}
		
		"SelectHintLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"SelectHintLabel"
			"font"			"ScoreboardMedium"
			"xpos"			"25"
			"xpos_lodef"	"37"
			"ypos"			"2"
			"zpos"			"1"
			"wide"			"300"
			"tall"			"39"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"1"
			"enabled"		"1"
			"labelText"		"#GameUI_Select"
			"textAlignment"	"Left"
			"dulltext"		"0"
			"brighttext"	"0"
		}
		
		"GamerCardIcon"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"GamerCardIcon"
			"font"			"GameUIButtons"
			"xpos"			"150"
			"xpos_hidef"	"145"
			"ypos"			"0"
			"zpos"			"1"
			"wide"			"300"
			"tall"			"38"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"1"
			"enabled"		"1"
			"labelText"		"A"
			"textAlignment"	"Left"
			"dulltext"		"0"
			"brighttext"	"0"
		}
		
		"GamerCardLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"GamerCardLabel"
			"font"			"ScoreboardMedium"
			"xpos"			"170"
			"xpos_lodef"	"177"
			"ypos"			"2"
			"zpos"			"1"
			"wide"			"300"
			"tall"			"39"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"1"
			"enabled"		"1"
			"labelText"		"#TF_ViewGamercard"
			"textAlignment"	"Left"
			"dulltext"		"0"
			"brighttext"	"0"
		}
		
		"ReputationIcon"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"ReputationIcon"
			"font"			"GameUIButtons"
			"xpos"			"350"
			"xpos_hidef"	"378"
			"ypos"			"0"
			"zpos"			"1"
			"wide"			"300"
			"tall"			"38"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"1"
			"enabled"		"1"
			"labelText"		"X"
			"textAlignment"	"Left"
			"dulltext"		"0"
			"brighttext"	"0"
		}
		
		"ReputationLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"ReputationLabel"
			"font"			"ScoreboardMedium"
			"xpos"			"403"
			"xpos_lodef"	"377"
			"ypos"			"2"
			"zpos"			"1"
			"wide"			"300"
			"tall"			"39"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"1"
			"enabled"		"1"
			"labelText"		"#GameUI_PlayerReview"
			"textAlignment"	"Left"
			"dulltext"		"0"
			"brighttext"	"0"
		}
	}				
	
	"MvMScoreboard"
	{
		"ControlName"		"CTFHudMannVsMachineScoreboard"
		"fieldName"			"MvMScoreboard"
		"xpos"				"0"
		"ypos"				"0"
		"zpos"				"10"
		"wide"				"f0"
		"tall"				"480"
		"visible"			"0"
		"enabled"			"1"
		
		"verbose"			"1"
		
		if_mvm
		{
			"visible"		"1"
		}
	}
}
