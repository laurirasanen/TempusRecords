//Monochrome scheme for yA_HUD, based on doodles' / Counter Strike's scheme
#base "SourceSchemeBase.res"
Scheme
{
	Colors
	{
		// HUD		
		"White"				"227 227 227 255"
		"OffWhite"			"227 227 227 255"
		"DullWhite"			"125 125 125 255"
		"TransparentBlack"		"0 0 0 255"
		"Blank"				"0 0 0 0"
		"Black"				"54 54 54 255"	
		"BlackTran"			"54 54 54 255"
		"Gray"				"177 177 177 255"
		"ButtonHover"		"74 74 74 255"
		"WhiteBG"			"225 225 225 255"
		"HudBG"				"54 54 54 255"	
		
		// TF2
	    "TFDarkBrown"               "60 56 53 255"
	    "TFDarkBrownTransparent"    "60 56 53 255"
	    "TFTanBright"               "236 227 203 255"
	    "TFTanLight"                "100 100 100 255"
	    "TFTanMedium"               "80 80 80 255"
	    
	    "TFTanLightBright"          "229 223 211 255"
	    "TFTanLightDark"            "96 90 78 255"
	    
	    "TFOrangeBright"            "156 82 33 255"
	    
	    "TFTextBright"              "251 236 203 255"
	    "TFTextLight"               "201 188 162 255"
	    "TFTextMedium"              "131 121 104 255"
	    "TFTextMediumDark"          "104 96 83 255"
	    "TFTextBlack"               "42 39 37 255"
	    "TFTextDull"                "131 121 104 255"

	    "TFMediumBrown"		"69 64 58 255"

	    "QuickListBGDeselected"		"42 42 42 255"
	    "QuickListBGSelected"               "80 80 80 255"
	    
	    "Blank"				"0 0 0 0"

		"ControlBG"			"74 74 74 255"		// background color of controls
		"ControlDarkBG"		"104 104 104 255"	// darker background color; used for background of scrollbars
		"WindowBG"			"64 64 64 255"		// background color of text edit panes (chat, text entries, etc.)
		"SelectionBG"		"100 100 100 255"		// background color of any selected text or menu item
		"SelectionBG2"		"64 64 64 255"		// selection background in window w/o focus
		"ListBG"			"77 77 77 255"		// background of server browser, buddy list, etc.
	}
	BaseSettings
	{
		// scheme-specific colors
		Border.Bright					"200 200 200 255"
		Border.Dark						"40 40 40 255"
		Border.Selection				"0 0 0 255"	//default/selected button

		Button.TextColor				"196 196 196 255"
		Button.BgColor					"120 120 120 255"
		Button.ArmedTextColor			"White"
		Button.ArmedBgColor				"ButtonHover"
		Button.DepressedTextColor		"White"
		Button.DepressedBgColor			"Blank"
		Button.FocusBorderColor			"Blank"
		
		CheckButton.TextColor			"OffWhite"
		CheckButton.SelectedTextColor	"White"
		CheckButton.BgColor				"HudBG"
		CheckButton.HighlightFgColor	"WhiteBG"
		CheckButton.ArmedBgColor		"Blank"
		CheckButton.DepressedBgColor	"Blank"
		CheckButton.Border1  			"Black"
		CheckButton.Border2  			"Black"
		CheckButton.Check				"White"
		CheckButton.DisabledBgColor	   	"Blank"

		ToggleButton.SelectedTextColor	"TFTextBright"
		
		ComboBoxButton.ArrowColor		"DullWhite"
		ComboBoxButton.ArmedArrowColor	"White"
		ComboBoxButton.BgColor			"Blank"
		ComboBoxButton.DisabledBgColor	"Blank"
		
		RadioButton.TextColor			"DullWhite"
		RadioButton.SelectedTextColor	"White"
		RadioButton.ArmedTextColor		"TFTextMedium"
		
		Frame.BgColor					"82 82 82 255"
		Frame.OutOfFocusBgColor			"90 90 90 255"
		FrameGrip.Color1				"200 200 200 255"
		FrameGrip.Color2				"225 225 225 255"
		FrameTitleButton.FgColor		"255 255 255 255"
		FrameTitleBar.Font				"UiBold"
		FrameTitleBar.TextColor			"White"
		FrameTitleBar.DisabledTextColor	"255 255 255 255"
		
		Label.TextDullColor				"DullWhite"
		Label.TextColor					"OffWhite"
		Label.TextBrightColor			"White"
		Label.SelectedTextColor			"White"
		Label.BgColor					"Blank"
		Label.DisabledFgColor1			"117 117 117 255"
		Label.DisabledFgColor2			"30 30 30 255"
		
		ListPanel.TextColor					"OffWhite"
		ListPanel.BgColor					"54 54 54 255"
		ListPanel.SelectedBgColor			"WhiteBG"
		ListPanel.SelectedOutOfFocusBgColor	"100 100 100 255"
		
		MainMenu.TextColor			"White"
		MainMenu.ArmedTextColor		"HudBG"
		MainMenu.Inset				"32"
		
		Menu.TextInset					"6"
		Menu.FgColor			"White"
		Menu.BgColor					"24 24 24 255"
		Menu.ArmedFgColor		"WhiteBG"
		Menu.ArmedBgColor				"WhiteBG"
		Menu.DividerColor		"BorderDark"
		
		ScrollBarButton.FgColor				"White"
		ScrollBarButton.BgColor				"Blank"
		ScrollBarButton.ArmedFgColor		"White"
		ScrollBarButton.ArmedBgColor		"Blank"
		ScrollBarButton.DepressedFgColor	"White"
		ScrollBarButton.DepressedBgColor	"Blank"

		ScrollBarSlider.FgColor				"100 100 100 255"
		ScrollBarSlider.BgColor				"70 70 70 255"
		
		Slider.NobColor				"108 108 108 255"
		Slider.TextColor			"180 180 180 255"
		Slider.TrackColor			"31 31 31 255"
		Slider.DisabledTextColor1	"117 117 117 255"
		Slider.DisabledTextColor2	"30 30 30 255"
		
		TextEntry.TextColor			"OffWhite"
		TextEntry.DisabledTextColor	"DullWhite"
		TextEntry.SelectedBgColor	"WhiteBG"
		
		// Borrowed from CS:S SourceScheme
		Frame.TitleTextInsetX			14
		Frame.ClientInsetY				9
		Frame.ClientInsetX				8
		Frame.FocusTransitionEffectTime	"0.3"
		Frame.TransitionEffectTime		"0.3"
		Frame.AutoSnapRange				"0"
		FrameTitleButton.BgColor		"Blank"
		FrameTitleButton.DisabledFgColor	"255 255 255 255"
		FrameTitleButton.DisabledBgColor	"Blank"
		FrameSystemButton.FgColor		"Blank"
		FrameSystemButton.BgColor		"Blank"
		FrameSystemButton.Icon			""
		FrameSystemButton.DisabledIcon	""
		FrameTitleBar.BgColor			"Blank"			//Title Bar
		FrameTitleBar.DisabledBgColor	"Blank"
		GraphPanel.FgColor				"White"
		GraphPanel.BgColor				"TransparentBlack"
		ListPanel.TextBgColor				"Blank"
		ListPanel.SelectedTextColor			"Black"
		ListPanel.EmptyListInfoTextColor	"OffWhite"
		Menu.TextColor					"White"
		Menu.ArmedTextColor				"Black"
		Panel.FgColor					"DullWhite"
		Panel.BgColor					"Blank"
		ProgressBar.FgColor				"White"
		ProgressBar.BgColor				"TransparentBlack"
		PropertySheet.TextColor			"OffWhite"
		PropertySheet.SelectedTextColor	"White"
		PropertySheet.TransitionEffectTime	"0.25"
		RichText.TextColor				"OffWhite"
		RichText.BgColor				"54 54 54 255"
		RichText.SelectedTextColor		"Black"
		RichText.SelectedBgColor		"WhiteBG"
		ScrollBar.Wide					17
		SectionedListPanel.HeaderTextColor	"White"
		SectionedListPanel.HeaderBgColor	"Blank"
		SectionedListPanel.DividerColor		"Black"
		SectionedListPanel.TextColor		"DullWhite"
		SectionedListPanel.BrightTextColor	"White"
		SectionedListPanel.BgColor			"HudBG"
		SectionedListPanel.SelectedTextColor			"Black"
		SectionedListPanel.SelectedBgColor				"WhiteBG"
		SectionedListPanel.OutOfFocusSelectedTextColor	"Black"
		SectionedListPanel.OutOfFocusSelectedBgColor	"100 100 100 255"
		TextEntry.BgColor			"64 64 64 242"									//Enter field
		TextEntry.CursorColor		"OffWhite"
		TextEntry.DisabledBgColor	"Blank"
		TextEntry.SelectedTextColor	"Black"
		TextEntry.OutOfFocusSelectedBgColor	"100 100 100 128"
		TextEntry.FocusEdgeColor	"0 0 0 196"
		ToggleButton.SelectedTextColor	"White"
		Tooltip.TextColor			"0 0 0 196"
		Tooltip.BgColor				"WhiteBG"
		TreeView.BgColor			"TransparentBlack"
		WizardSubPanel.BgColor		"Blank"
		MainMenu.DepressedTextColor	"150 150 150 128"
		MainMenu.MenuItemHeight		"25"
		MainMenu.Backdrop			"0 0 0 156"
		Console.TextColor			"OffWhite"
		Console.DevTextColor		"White"
		NewGame.TextColor			"White"
		NewGame.FillColor			"14 14 14 255"
		NewGame.SelectionColor		"WhiteBG"
		NewGame.DisabledColor		"128 128 128 196"
	}
	
	Fonts
	{
		"DefaultFixedOutline" //edited by INsane 2010 for small netgraph font on all screen sizes
		{
            "1" //For screen heights between 768 and 1023 (eg 4:3 aspect Width 1024X768 High... 16:9 aspect Width 1360x768 High, 16:9 aspect Width 1776x1000 High... 16:10 aspect Width 1280x768 High, 16:10 aspect Width 1280x800 High, 16:10 aspect Width 1400x900 High.)
            {
                "name"         "Microsoft Sans Serif" [$WINDOWS] // Standard is "Lucida Console" Options are "Microsoft Sans Serif" "Georgia" "Impact" "Arial MT" and the best for small = "Haettenschweiler" but is a MS office and Win7 font, can be downloaded, google "Haettenschweiler" and install in C:/Windows/Fonts
                "name"         "Lucida Console" [$X360]    //"Lucida Console"
                "name"         "Verdana" [$POSIX] // Apple Mac OS "Verdana" (default) Best small font = "Georgia" Mac Installation location: /Library/Fonts and is default on Mac OS
                "tall"         "13" [$POSIX]  // "11"                
                "tall"         "13"  //good positioning is ... "net_graphpos 203" and "net_graphheight 85" and ensure you select "outline" "1" with all others off with "Microsoft Sans Serif" font.
                "tall_lodef" "15" //"15"
                "tall_hidef" "20" //"20"                
                "weight"     "0"
                "range"         "0x0000 0x017F" //    Basic Latin, Latin-1 Supplement, Latin Extended-A
                "yres"         "768 1023"
                "outline"     "1"  //"1" //Adds a black outline around the text, good for standing out... that is, if the font allows it, use with caution on smaller fonts.
                "additive"     "0"  //not default added //This adds white to font...sort of a glow effect on coloured fonts and gives a washed out pastel look
                "antialias"  "0"  //not default added //smoothing the edges.
            }
            "2" //For screen heights between 1024 and 1199 (eg 4:3 aspect Width 1280X1024 High, Width 1400X1050 High...    16:9 aspect Width 1920x1080 High... 16:10 aspect Width 1680x1050 High.)
            {
                "name"         "Microsoft Sans Serif" [$WINDOWS] // Standard is "Lucida Console" Options are "Microsoft Sans Serif" "Georgia" "Impact" "Arial MT" and the best for small = "Haettenschweiler" but is a MS office and Win7 font, can be downloaded, google "Haettenschweiler" and install in C:/Windows/Fonts
                "name"         "Lucida Console" [$X360]    //"Lucida Console"
                "name"         "Arial" [$POSIX] // Apple Mac OS "Verdana" (default) Best small font = "Georgia" Mac Installation location: /Library/Fonts and is default on Mac OS
                "tall"         "14" [$POSIX]  // "11"                
                "tall"         "14"  // good positioning is ... net_graphheight 87 and net_graphpos 210 and ensure you select "outline" "1" with all others off with Ariel font.
                "tall_lodef" "15" //"15"
                "tall_hidef" "20" //"20"                
                "weight"     "0"
                "range"         "0x0000 0x017F" //    Basic Latin, Latin-1 Supplement, Latin Extended-A
                "yres"         "1024 1199"
                "outline"     "1"  //"1" //Adds a black outline around the text, good for standing out... that is, if the font allows it, use with caution on smaller fonts.
                "additive"     "0"  //not default added //This adds white to font...sort of a glow effect on coloured fonts and gives a washed out pastel look
                "antialias"  "0"  //not default added //smoothing the edges.
            }
            "3" //For screen heights between 1200 and 6000 (6000...wow that's freaking huge!) (eg 4:3 aspect Width 1600X1200 High... 16:10 aspect Width 1920x1200 High.... and beyond) 
            {
                "name"         "Microsoft Sans Serif" [$WINDOWS] // Standard is "Lucida Console" Options are "Microsoft Sans Serif" "Georgia" "Impact" "Arial MT" and the best for small = "Haettenschweiler" but is a MS office and Win7 font, can be downloaded, google "Haettenschweiler" and install in C:/Windows/Fonts
                "name"         "Lucida Console" [$X360]    //"Lucida Console"
                "name"         "Arial" [$POSIX] // Apple Mac OS "Verdana" (default) Best small font = "Georgia" and "Arial" Mac Installation location: /Library/Fonts and is default on Mac OS
                "tall"         "15" [$POSIX]  // "11"                
                "tall"         "15" // good positioning is ... net_graphheight 95 and net_graphpos 225 and ensure you select "outline" "1" with all others off with Ariel font.
                "tall_lodef" "15" //"15"
                "tall_hidef" "20" //"20"                
                "weight"     "0"
                "range"         "0x0000 0x017F" //    Basic Latin, Latin-1 Supplement, Latin Extended-A
                "yres"         "1200 6000"
                "outline"     "1"  //"1" //Adds a black outline around the text, good for standing out... that is, if the font allows it, use with caution on smaller fonts.
                "additive"     "0"  //not default added //This adds white to font...sort of a glow effect on coloured fonts and gives a washed out pastel look
                "antialias"  "0"  //not default added //smoothing the edges.
            }
		}
		"MainMenuFont"
		{
			"1"	[$WIN32]
			{
				"name"		"TF2 Build"
				"tall"		"18"
				"weight"	"500"
				"additive"	"0"
				"antialias" "1"
			}
		}
		"MenuLarge"
		{
			"1"	[$X360]
			{
				"tall_hidef"		"24"
			}
		}
		"ServerBrowserTitle"
		{
			"1"
			{
				"name"		"TF2 Build"
				"tall"		"35"
				"tall_lodef"	"40"
				"weight"	"500"
				"additive"	"0"
				"antialias" "1"
			}
		}
		"Default" [$OSX]
		{
			"1"
			{
				"name"		"Verdana"
				"tall"		"14"
				"weight"	"500"
			}
		}
		"ServerBrowserSmall"
		{
			"1"
			{
				"name"		"Tahoma"
				"tall"		"16"
				"weight"	"0"
				"range"		"0x0000 0x017F" //	Basic Latin, Latin-1 Supplement, Latin Extended-A
				"yres"	"480 599"
			}
			"2"
			{
				"name"		"Tahoma"
				"tall"		"16"
				"weight"	"0"
				"range"		"0x0000 0x017F" //	Basic Latin, Latin-1 Supplement, Latin Extended-A
				"yres"	"600 767"
			}
			"3"
			{
				"name"		"Tahoma"
				"tall"		"16"
				"weight"	"0"
				"range"		"0x0000 0x017F" //	Basic Latin, Latin-1 Supplement, Latin Extended-A
				"yres"	"768 1023"
				"antialias"	"1"
			}
			"4"
			{
				"name"		"Tahoma"
				"tall"		"19"
				"weight"	"0"
				"range"		"0x0000 0x017F" //	Basic Latin, Latin-1 Supplement, Latin Extended-A
				"yres"	"1024 1199"
				"antialias"	"1"
			}
			"5"
			{
				"name"		"Tahoma"
				"tall"		"19"
				"weight"	"0"
				"range"		"0x0000 0x017F" //	Basic Latin, Latin-1 Supplement, Latin Extended-A
				"yres"	"1200 6000"
				"antialias"	"1"
			}
		}	
		AchievementItemTitle	[$WIN32]
		{
			"1"
			{
				"name"		"Arial" [!$OSX]
				"name"		"Verdana Bold" [$OSX]
				"weight"		"1500"
				"tall"			"16" [!$OSX]
				"tall"			"18" [$OSX]
				"antialias"		"1"
			}
		}
		AchievementItemTitleLarge	[$WIN32]
		{
			"1"
			{
				"name"		"Arial" [!$OSX]
				"name"		"Verdana Bold" [$OSX]
				"weight"		"1500"
				"tall"			"18" [!$OSX]
				"tall"			"19" [$OSX]
				"antialias"		"1"
			}
		}
		AchievementItemDescription	[$WIN32]
		{
			"1"
			{
				"name"		"Arial" [!$OSX]
				"name"		"Verdana" [$OSX]
				"weight"		"1000"
				"tall"			"14" [!$OSX]
				"tall"			"12" [$OSX]
				"antialias"		"1" [!$OSX]
			}
		}

	}
	CustomFontFiles
	{
		"9"
		{
			"font" "resource/TF2Build.ttf"
			"name" "TF2 Build"
			"russian"
			{
				"range" "0x0000 0xFFFF"
			}
			"polish"
			{
				"range" "0x0000 0xFFFF"
			}
		}
	}	
}
