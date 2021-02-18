"Resource/UI/MvMScoreboard.res"
{		
	"WaveStatusPanel"
	{
		"ControlName"		"CWaveStatusPanel"
		"fieldName"			"WaveStatusPanel"
		"xpos"				"c-300"
		"ypos"				"-22"
		"zpos"				"0"
		"wide"				"600"
		"tall"				"67"
		"visible"			"1"
		"enabled"			"1"
		"verbose"			"1"
	}
	
	"PopFileLabel"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"PopFileLabel"
		"font"			"NoveMedium10"
		"labelText"		"%popfile%"
		"textAlignment"	"east"
		"xpos"			"c"
		"ypos"			"r11"
		"wide"			"293"
		"tall"			"11"
		"fgcolor"		"Black"
	}

	"MvMNameLabel"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"MvMNameLabel"
		"font"			"NoveMedium10"
		"labelText"		"#TF_Scoreboard_Name"
		"textAlignment"	"west"
		"xpos"			"c-280"
		"ypos"			"r11"
		"wide"			"293"
		"tall"			"11"
		"fgcolor"		"Black"
	}

	"MvMTourLabel"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"MvMTourLabel"
		"font"			"NoveMedium10"
		"labelText"		"#TF_MvMScoreboard_Tour"
		"textAlignment"	"east"
		"xpos"			"c-410"
		"ypos"			"r11"
		"wide"			"293"
		"tall"			"11"
		"fgcolor"		"Black"
	}

	"MvMScoreLabel"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"MvMScoreLabel"
		"font"			"NoveMedium10"
		"labelText"		"#TF_Scoreboard_Score"
		"textAlignment"	"east"
		"xpos"			"c-367"
		"ypos"			"r11"
		"wide"			"293"
		"tall"			"11"
		"fgcolor"		"Black"
	}

	"MvMDamageLabel"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"MvMDamageLabel"
		"font"			"NoveMedium10"
		"labelText"		"#TF_MvMScoreboard_Damage"
		"textAlignment"	"east"
		"xpos"			"c-324"
		"ypos"			"r11"
		"wide"			"293"
		"tall"			"11"
		"fgcolor"		"Black"
	}

	"MvMTankLabel"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"MvMTankLabel"
		"font"			"NoveMedium10"
		"labelText"		"#TF_MvMScoreboard_Tank"
		"textAlignment"	"east"
		"xpos"			"c-281"
		"ypos"			"r11"
		"wide"			"293"
		"tall"			"11"
		"fgcolor"		"Black"
	}

	"MvMHealingLabel"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"MvMHealingLabel"
		"font"			"NoveMedium10"
		"labelText"		"#TF_MvMScoreboard_Healing"
		"textAlignment"	"east"
		"xpos"			"c-237"
		"ypos"			"r11"
		"wide"			"293"
		"tall"			"11"
		"fgcolor"		"Black"
	}

	"MvMMoneyLabel"
	{
		"ControlName"	"CExLabel"
		"fieldName"		"MvMMoneyLabel"
		"font"			"NoveMedium10"
		"labelText"		"#TF_MvMScoreboard_Money"
		"textAlignment"	"east"
		"xpos"			"c-195"
		"ypos"			"r11"
		"wide"			"293"
		"tall"			"11"
		"fgcolor"		"Black"
	}

	"DifficultyContainer"
	{
		"ControlName"	"EditablePanel"
		"fieldName"		"DifficultyContainer"
		"xpos"			"0"
		"ypos"			"60"
		"wide"			"f0"
		"tall"			"480"
		"visible"		"1"
		
		"DifficultyValue"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"DifficultyValue"
			"font"			"HeavyCaps18"
			"labelText"		"%difficultyvalue%"
			"textAlignment"	"east"
			"xpos"          "c24" 
            "ypos"          "c10" 
            "zpos"          "2"
            "wide"          "268"
            "tall"          "17"
			"fgcolor"		"White"
		}
	}
	
	"PlayerListBackground"
	{
		"ControlName"		"ScalableImagePanel"
		"fieldName"		"PlayerListBackground"
		"xpos"			"100"
		"ypos"			"75"
		"zpos"			"-1"
		"wide"			"450"
		"tall"			"150"
		"visible"		"0"
		"enabled"		"1"
		"image"			"../hud/tournament_panel_brown"
		
		"scaleImage"		"1"
		
		"src_corner_height"	"22"				// pixels inside the image
		"src_corner_width"	"22"
	
		"draw_corner_width"	"5"				// screen size of the corners ( and sides ), proportional
		"draw_corner_height" 	"5"	
	}
	
	"MvMPlayerList"
	{
		"ControlName"	"SectionedListPanel"
		"fieldName"		"MvMPlayerList"
		"xpos"			"c-294"
		"ypos"			"c75"
		"wide"			"400"
		"tall"			"155"
		"pinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"	"0"
		"autoresize"	"3"
		"linespacing"	"24"
		"textcolor"		"White"
		"medal_width"	"0"
	}
	
	"CreditStatsContainer"
	{
		"ControlName"	"EditablePanel"
		"fieldName"		"CreditStatsContainer"
		"xpos"			"0"
		"ypos"			"190"
		"zpos"			"30"
		"wide"			"f0"
		"tall"			"480"
		"visible"		"1"
		
		"CreditStatsBackground"
		{
			"ControlName"		"ScalableImagePanel"
			"fieldName"		"CreditStatsBackground"
			"xpos"			"0"
			"ypos"			"0"
			"zpos"			"-1"
			"wide"			"400"
			"tall"			"135"
			"autoResize"	"0"
			"pinCorner"		"0"
			"visible"		"0"
			"enabled"		"1"
			"image"			"../HUD/tournament_panel_brown"

			"src_corner_height"	"22"				// pixels inside the image
			"src_corner_width"	"22"
		
			"draw_corner_width"	"5"				// screen size of the corners ( and sides ), proportional
			"draw_corner_height" 	"5"	
		}
		
		"CreditsLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"CreditsLabel"
			"font"			"Default"
			"labelText"		"#TF_PVE_Currency"
			"textAlignment" "north-west"
			"xpos"			"8"
			"ypos"			"8"
			"wide"			"200"
			"fgcolor"		"Blank"
		}
		
		"PreviousWaveCreditInfoPanel"
		{
			"ControlName"	"CCreditDisplayPanel"
			"fieldName"		"PreviousWaveCreditInfoPanel"
			"xpos"			"c108"
			"ypos"			"r356"
			"tall"			"100"
			"wide"			"200"
			"visible"		"1"
		}
		
		"TotalGameCreditInfoPanel"
		{
			"ControlName"	"CCreditDisplayPanel"
			"fieldName"		"TotalGameCreditInfoPanel"
			"xpos"			"c108"
			"ypos"			"r282"
			"tall"			"100"
			"wide"			"200"
			"visible"		"1"
		}
		
		"PreviousWaveCreditSpendPanel"
		{
			"ControlName"	"CCreditSpendPanel"
			"fieldName"		"PreviousWaveCreditSpendPanel"
			"xpos"			"c198"
			"ypos"			"r356"
			"tall"			"100"
			"wide"			"200"
			"visible"		"1"
		}
		
		"TotalGameCreditSpendPanel"
		{
			"ControlName"	"CCreditSpendPanel"
			"fieldName"		"TotalGameCreditSpendPanel"
			"xpos"			"c198"
			"ypos"			"r282"
			"tall"			"100"
			"wide"			"200"
			"visible"		"1"
		}
		
		"RespecStatusLabel"
		{
			"ControlName"	"CExLabel"
			"fieldName"		"RespecStatusLabel"
			"font"			"NotoBold12"
			"labelText"		"%respecstatus%"
			"textAlignment" "east"
			"xpos"			"0"
			"ypos"			"r197"
			"zpos"			"30"
			"wide"			"520"
			"tall"			"13"
			"textinsetx"	"3"
			"fgcolor"		"NotoWhite"
		}
	}
}
