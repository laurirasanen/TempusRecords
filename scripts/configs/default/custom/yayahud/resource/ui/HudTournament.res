"Resource/UI/HudTournament.res"
{
	HudTournament
	{
		"ControlName"		"EditablePanel"
		"fieldName"				"HudTournament"
				
		"xpos"					"0"
		"ypos"					"0"
		"wide"					"f0"
		"tall"					"480"

		"team1_player_base_offset_x"		"-75"
		"team1_player_base_y"				"68"
		"team1_player_delta_x"				"-47"
		"team1_player_delta_y"				"0"
		"team2_player_base_offset_x"		"25"
		"team2_player_base_y"				"0"
		"team2_player_delta_x"				"56"
		"team2_player_delta_y"				"0"
		"teams_player_delta_x_comp"			"56"
		
		"playerpanels_kv"
		{
			"visible"		"0"
			"wide"			"50"
			"tall"			"33"
			"zpos"			"1"
			
			"color_ready"	"0 255 0 220"
			"color_notready"	"0 0 0 220"

			"BG"
			{
				"ControlName" "ImagePanel"
				"fieldName"   "BG"
				"xpos"        "0"
				"ypos"        "0"
				"zpos"        "2"
				"wide"        "55"
				"tall"        "35"
				"autoResize"		"0"
				"pinCorner"		"0"
				"fillcolor"		"60 60 60 255"
				"visible"			"0"
				"enabled"			"1"
			
			}
									  			
			"playername"
			{
				"ControlName"	"CExLabel"
				"fieldName"		"playername"
				"font"		"Regular9"
				"xpos"			"5"
				"ypos"			"24"
				"zpos"			"5"
				"wide"			"50"
				"tall"			"8"
				"autoResize"	"0"
				"pinCorner"		"0"
				"visible"		"1"
				"labelText"		"%playername%"
				"textAlignment"	"north-west"
				"fgcolor"		"60 60 60 255"
					
				if_mvm
				{
					"xpos"				"4"
					"ypos"				"25"
					"wide"				"48"
					"textAlignment"		"center"
					"font"				"Regular9"
					"fgcolor"			"White"
				}

				if_competitive
				{
					"xpos"				"4"
					"ypos"				"25"
					"wide"				"48"
					"textAlignment"		"center"
					"font"				"PlayerPanelPlayerName"
					"fgcolor"			"White"
				}

				if_readymode
				{
					"xpos"				"4"
					"ypos"				"25"
					"wide"				"48"
					"textAlignment"		"center"
					"font"				"PlayerPanelPlayerName"
					"fgcolor"			"White"
				}
			}
			
			"classimage"
			{
				"ControlName"	"CTFClassImage"
				"fieldName"		"classimage"
				"xpos"			"2"
				"ypos"			"2"
				"zpos"			"3"
				"wide"			"22"
				"tall"			"22"
				"visible"		"1"
				"enabled"		"1"
				"image"			"../hud/class_scoutred"
				"scaleImage"	"1"	
				
				if_mvm
				{
					"xpos"			"5"
					"ypos"			"4"
					"wide"			"20"
					"tall"			"20"
					"image"			"../vgui/hud_connecting"
				}

				if_competitive
				{
					"xpos"			"5"
					"ypos"			"4"
					"wide"			"20"
					"tall"			"20"
					"image"			"../vgui/hud_connecting"
				}

				if_readymode
				{
					"xpos"			"5"
					"ypos"			"4"
					"wide"			"20"
					"tall"			"20"
					"image"			"../vgui/hud_connecting"
				}
			}
			
			"classimagebg"
			{
				"ControlName"		"Panel"
				"fieldName"		"classimagebg"
				"xpos"			"5"
				"ypos"			"4"
				"zpos"			"2"
				"wide"			"20"
				"tall"			"20"
				"visible"		"0"
				"enabled"		"1"
				"bgcolor_override"		"Black"
				"PaintBackgroundType"	"0"
				
				if_mvm
				{
					"visible"		"1"
				}

				if_competitive
				{
					"visible"		"1"
				}

				if_readymode
				{
					"visible"		"1"
				}
			}
			
			"HealthIcon"
			{
				"ControlName"		"EditablePanel"
				"fieldName"			"HealthIcon"
				"xpos"				"22"
				"ypos"				"-3"
				"zpos"				"3"
				"wide"				"32"
				"tall"				"32"
				"visible"			"1"
				"enabled"			"1"	
				"HealthBonusPosAdj"	"10"
				"HealthDeathWarning"		"0.49"
				"TFFont"					"HudFontSmallest"
				"HealthDeathWarningColor"	"HUDDeathWarning"
				"TextColor"					"HudOffWhite"
			}
			
			"ReadyBG"
			{
				"ControlName"		"ScalableImagePanel"
				"fieldName"		"ReadyBG"
				"xpos"			"32"
				"ypos"			"6"
				"zpos"			"3"
				"wide"			"0"
				"tall"			"0"
				"autoResize"	"0"
				"pinCorner"		"0"
				"visible"		"0"
				"enabled"		"1"
				"image"			"../HUD/tournament_panel_brown"

				"src_corner_height"	"22"				// pixels inside the image
				"src_corner_width"	"22"
			
				"draw_corner_width"	"0"				// screen size of the corners ( and sides ), proportional
				"draw_corner_height" 	"0"
				
				if_mvm
				{
					"visible"		"1"
				}

				if_competitive
				{
					"visible"		"1"
				}

				if_readymode
				{
					"visible"		"1"
				}
			}
			
			"ReadyImage"
			{
				"ControlName"		"ImagePanel"
				"fieldName"		"ReadyImage"
				"xpos"			"34"
				"ypos"			"8"
				"zpos"			"4"
				"wide"			"12"
				"tall"			"12"
				"autoResize"	"0"
				"pinCorner"		"0"
				"visible"		"0"
				"enabled"		"1"
				"image"			"hud/checkmark"
				"scaleImage"		"1"

				if_mvm
				{
					"visible"		"1"
				}

				if_competitive
				{
					"visible"		"1"
				}

				if_readymode
				{
					"visible"		"1"
				}
			}
			
			"respawntime"
			{
				"ControlName"	"CExLabel"
				"fieldName"		"respawntime"
				"font"			"DefaultSmall"
				"xpos"			"30"
				"ypos"			"18"
				"zpos"			"5"
				"wide"			"23"
				"tall"			"10"
				"autoResize"	"0"
				"pinCorner"		"0"
				"visible"		"1"
				"labelText"		"%respawntime%"
				"textAlignment"	"west"
				//"fgcolor"		"235 226 202 255"
			}
			
			"chargeamount"
			{
				"ControlName"	"CExLabel"
				"fieldName"		"chargeamount"
				"font"			"DefaultSmall"
				"xpos"			"25"
				"ypos"			"17"
				"zpos"			"6"
				"wide"			"25"
				"tall"			"15"
				"autoResize"	"0"
				"pinCorner"		"0"
				"visible"		"1"
				"labelText"		"%chargeamount%"
				"textAlignment"	"north"
				"fgcolor"		"0 255 0 255"
				
				if_mvm
				{	
					"visible"		"0"
				}
				
				if_competitive
				{	
					"visible"		"0"
				}
				
				if_readymode
				{	
					"visible"		"0"
				}
			}
			
			"specindex"
			{
				"ControlName"	"CExLabel"
				"fieldName"		"specindex"
				"font"			"DefaultVerySmall"
				"xpos"			"4"
				"ypos"			"2"
				"zpos"			"5"
				"wide"			"50"
				"tall"			"8"
				"autoResize"	"0"
				"pinCorner"		"0"
				"visible"		"1"
				"labelText"		"%specindex%"
				"textAlignment"	"north-west"
				//"fgcolor"		"235 226 202 255"
			}
			
			if_mvm
			{
				"wide"		"55"
				"tall"		"35"
			}
			
			if_competitive
			{
				"wide"		"55"
				"tall"		"35"
			}
			
			if_readymode
			{
				"wide"		"55"
				"tall"		"35"
			}
		}
	}
	"HudTournamentBG"
	{
		"ControlName"		"ScalableImagePanel"
		"fieldName"		"HudTournamentBG"
		"xpos"			"99999"
		"ypos"			"0"
		"zpos"			"-1"
		"wide"			"0"
		"tall"			"0"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"image"			"../HUD/tournament_panel_brown"
		"proportionaltoparent"	"1"

		"src_corner_height"	"23"				// pixels inside the image
		"src_corner_width"	"23"
		
		"draw_corner_width"	"8"				// screen size of the corners ( and sides ), proportional
		"draw_corner_height" 	"8"		
	}
    "BlueTourBG"
	{
		"ControlName" "ImagePanel"
		"fieldName"   "BlueTourBG"
		"xpos"        "c-150"
		"ypos"        "0"
		"zpos"        "1"
		"wide"        "150"
		"tall"        "17"
		"autoResize"		"0"
		"pinCorner"		"0"
		"fillcolor"		"Blue"
		"visible"			"1"
		"enabled"			"1"
        
        if_mvm
		{
			"visible"		"0"
		}
		
		if_competitive
		{
			"visible"		"0"
		}

		if_readymode
		{
			"visible"		"0"
		}
	}
    "RedTourBG"
	{
		"ControlName" "ImagePanel"
		"fieldName"   "RedTourBG"
		"xpos"        "c"
		"ypos"        "0"
		"zpos"        "1"
		"wide"        "150"
		"tall"        "17"
		"autoResize"		"0"
		"pinCorner"		"0"
		"fillcolor"		"Red"
		"visible"			"1"
		"enabled"			"1"
        
        if_mvm
		{
			"visible"		"0"
		}
		
		if_competitive
		{
			"visible"		"0"
		}

		if_readymode
		{
			"visible"		"0"
		}
	}
    "CondTourBG"
	{
		"ControlName" "ImagePanel"
		"fieldName"   "CondTourBG"
		"xpos"        "c-150"
		"ypos"        "17"
		"zpos"        "1"
		"wide"        "300"
		"tall"        "10"
		"autoResize"		"0"
		"pinCorner"		"0"
		"fillcolor"		"DarkGray"
		"visible"			"1"
		"enabled"			"1"
        
        if_mvm
		{
			"visible"		"0"
		}
		
		if_competitive
		{
			"visible"		"0"
		}

		if_readymode
		{
			"visible"		"0"
		}
	}
	"TournamentLabel"
	{	
		"ControlName"		"Label"
		"fieldName"		"TournamentLabel"
		"font"			"HudFontSmall"
		"xpos"			"8"
		"ypos"			"9"
		"zpos"			"1"
		"wide"			"0"
		"tall"			"0"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"0"
		"wrap"			"0"
		"labelText"		"%tournamentstatelabel%"
		"textAlignment"		"north-west"

		if_mvm
		{
			"visible"		"0"
		}

		if_competitive
		{
			"visible"		"0"
		}

		if_readymode
		{
			"visible"		"0"
		}
	}
	
	"TournamentBlueLabel"
	{	
		"ControlName"		"CExLabel"
		"fieldName"		"TournamentBLUELabel"
		"font"			"HeavyCaps18"
		"xpos"			"c-146"
		"ypos"			"-2"
		"zpos"			"2"
		"wide"			"120"
		"tall"			"20"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"wrap"			"0"
		"fgcolor"			"White"
		"labelText"		"%bluenamelabel%"
		"textAlignment"		"west"

		if_mvm
		{
			"visible"		"0"
		}
		
		if_competitive
		{
			"visible"		"0"
		}

		if_readymode
		{
			"visible"		"0"
		}
	}
	"TournamentBLUEStateLabel"
	{	
		"ControlName"		"CExLabel"
		"fieldName"		"TournamentBLUEStateLabel"
		"font"			"NoveMedium12"
		"xpos"			"c-160"
		"ypos"			"-3"
		"zpos"			"3"
		"wide"			"156"
		"tall"			"20"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"wrap"			"0"
		"fgcolor"			"White"
		"labelText"		"%bluestate%"
		"textAlignment"		"east"

		if_mvm
		{
			"visible"		"0"
		}
		
		if_competitive
		{
			"visible"		"0"
		}

		if_readymode
		{
			"visible"		"0"
		}
	}
	"TournamentREDLabel"
	{	
		"ControlName"		"CExLabel"
		"fieldName"		"TournamentREDLabel"
		"font"			"HeavyCaps18"
		"xpos"			"c"
		"ypos"			"-2"
		"zpos"			"2"
		"wide"			"146"
		"tall"			"19"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"wrap"			"0"
		"fgcolor"			"White"
		"labelText"		"%rednamelabel%"
		"textAlignment"		"east"

		if_mvm
		{
			"visible"		"0"
		}
		
		if_competitive
		{
			"visible"		"0"
		}

		if_readymode
		{
			"visible"		"0"
		}
	}
	"TournamentREDStateLabel"
	{	
		"ControlName"		"CExLabel"
		"fieldName"		"TournamentREDStateLabel"
		"font"			"NoveMedium12"
		"xpos"			"c4"
		"ypos"			"-3"
		"zpos"			"3"
		"wide"			"165"
		"tall"			"20"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"wrap"			"0"
		"fgcolor"			"White"
		"labelText"		"%redstate%"
		"textAlignment"		"west"

		if_mvm
		{
			"visible"		"0"
		}
		
		if_competitive
		{
			"visible"		"0"
		}

		if_readymode
		{
			"visible"		"0"
		}
	}
	"TournamentConditionLabel"
	{	
		"ControlName"		"CExLabel"
		"fieldName"		"TournamentConditionLabel"
		"font"			"NoveMedium10"
		"fgcolor"		"White"
        "textinsetx"	"0"
		"use_proportional_insets" "1"
		"xpos"			"c-140"
		"ypos"			"16"
		"zpos"			"3"
		"wide"			"280"
		"tall"			"10"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"wrap"			"0"
		"labelText"		"%winconditions%"
		"textAlignment"		"center"

		if_mvm
		{
			"visible"		"0"
		}
		
		if_competitive
		{
			"visible"		"0"
		}

		if_readymode
		{
			"visible"		"1"
			"xpos"			"c-140"
			"ypos"			"40"
		}
	}
    "ReadyUpLabel"
	{	
		"ControlName"		"CExLabel"
		"fieldName"		"ReadyUpLabel"
		"font"			"NoveMedium12"
		"fgcolor"		"White"
        "textinsetx"	"0"
		"use_proportional_insets" "0"
		"xpos"			"c-25"
		"ypos"			"28"
		"zpos"			"111"
		"wide"			"100"
		"tall"			"20"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"wrap"			"0"
		"labelText"		"Press"
		"textAlignment"		"north-west"
        
        if_mvm
		{
			"visible"		"0"
		}
		
		if_competitive
		{
			"visible"		"0"
		}

		if_readymode
		{
			"visible"		"0"
		}
	}
	"HudTournamentBGHelp"
	{
		"ControlName"		"ScalableImagePanel"
		"fieldName"		"HudTournamentBGHelp"
		"xpos"			"0"
		"ypos"			"9999"
	}
	"TournamentInstructionsLabel"
	{	
		"ControlName"		"CExLabel"
		"fieldName"		"TournamentInstructionsLabel"
		"font"			"NoveMedium12"
		"fgcolor"		"White"
		"xpos"			"c9"
		"ypos"			"28"
		"wide"			"24"
		"tall"			"15"
		"zpos"			"1"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"wrap"			"1"
		"labelText"		"%readylabel%"
		"textAlignment"		"north-west"
        
        if_mvm
		{
			"font"			"ChatFont"
            "textAlignment"		"center"
			"xpos"			"c-35"
			"ypos"			"102"
			"wide"			"200"
			"tall"			"12"
			"zpos"			"3"
			"visible"			"1"
		}
        
        if_competitive
		{
			"font"			"ChatFont"
            "textAlignment"		"center"
			"xpos"			"c-35"
			"ypos"			"102"
			"wide"			"200"
			"tall"			"12"
			"zpos"			"3"
			"visible"			"1"
		}
        
        if_readymode
		{
			"font"			"ChatFont"
            "textAlignment"		"center"
			"xpos"			"c-35"
			"ypos"			"102"
			"wide"			"200"
			"tall"			"12"
			"zpos"			"3"
			"visible"			"1"
		}
	}
	
	"TournamentInstructionsLabelShadow"
	{	
		"ControlName"		"CExLabel"
		"fieldName"		"TournamentInstructionsLabelShadow"
		"font"			"TFFontSmall"
		"xpos"			"0"
		"ypos"			"54"
		"wide"			"0"
		"tall"			"0"
		"zpos"			"2"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"1"
		"wrap"			"0"
		"labelText"		"%readylabel%"
		"textAlignment"		"center"
	}
	
	"CountdownBG"
	{
		"ControlName"		"ScalableImagePanel"
		"fieldName"		"CountdownBG"
		"xpos"			"238"
		"ypos"			"r33330"
		"zpos"			"-1"
		"wide"			"0"
		"tall"			"0"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"0"
		"image"			"../HUD/color_panel_red"

		"src_corner_height"	"23"				// pixels inside the image
		"src_corner_width"	"23"
		
		"draw_corner_width"	"5"				// screen size of the corners ( and sides ), proportional
		"draw_corner_height" 	"5"	
	}

	"CountdownLabel"
	{	
		"ControlName"		"CExLabel"
		"fieldName"		"CountdownLabel"
		"font"			"Medium12Shadow"
		"xpos"			"c-16"
		"ypos"			"r40"
		"wide"			"26"
		"tall"			"25"
		"zpos"			"1"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"0"
		"enabled"		"1"
		"wrap"			"0"
		"fgcolor"		"White"
		"labelText"		"%tournamentstatelabel%"
		"textAlignment"		"center"
	}
	"CountdownLabelShadow"
	{	
		"ControlName"		"CExLabel"
		"fieldName"		"CountdownLabelShadow"
		"font"			"HudFontGiant"
		"xpos"			"231"
		"ypos"			"r54"
		"wide"			"0"
		"tall"			"0"
		"zpos"			"1"
		"autoResize"		"0"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"wrap"			"0"
		"labelText"		"%tournamentstatelabel%"
		"textAlignment"		"center"
		"fgcolor"		"Black"
	}
}
