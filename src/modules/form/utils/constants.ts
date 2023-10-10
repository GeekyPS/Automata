class Constants {
  static readonly divSelector: string =
    "#mG61Hd > div.RH5hzf.RLS9Fe > div > div.o3Dpx > div";
  static readonly titleSelector: string =
    "#mG61Hd > div.RH5hzf.RLS9Fe > div > div.o3Dpx > div:nth-child($) > div > div > div.z12JJ > div";
  static readonly submitSelector: string =
    "#mG61Hd > div.RH5hzf.RLS9Fe > div > div.ThHDze > div.DE3NNc.CekdCb > div.lRwqcd > div";
  static readonly inputSelector: string =
    "#mG61Hd > div.RH5hzf.RLS9Fe > div > div.o3Dpx > div:nth-child($) > div > div > div.AgroKb > div > div.aCsJod.oJeWuf > div > div.Xb9hP > input";
  static readonly checkBoxSelector:string = 
    "#mG61Hd > div.RH5hzf.RLS9Fe > div > div.o3Dpx > div:nth-child($) > div > div > div.Y6Myld > div:nth-child(2) > div:nth-child(1) > label > div > div:nth-child(1)";
  static readonly textAreaSelector: string =
    "#mG61Hd > div.RH5hzf.RLS9Fe > div > div.o3Dpx > div:nth-child($) > div > div > div.AgroKb > div > div.RpC4Ne.oJeWuf > div.Pc9Gce.Wic03c > textarea";
  static readonly multiChoiceSelector:string = 
    "#mG61Hd > div.RH5hzf.RLS9Fe > div > div.o3Dpx > div:nth-child($) > div > div > div.oyXaNc > div:nth-child(2) > div > span > div > div:nth-child(1) > label > div > div:nth-child(1) > div";
  static readonly dropdownSelector: string = 
    "#mG61Hd > div.RH5hzf.RLS9Fe > div > div.o3Dpx > div:nth-child($) > div > div > div.vQES8d > div";
  static readonly dropdownOptionSelector: string = 
    "#mG61Hd > div.RH5hzf.RLS9Fe > div > div.o3Dpx > div:nth-child($) > div > div > div.vQES8d > div > div:nth-child(2) > div:nth-child(3)";
  static readonly linearScaleSelector: string = 
    `#mG61Hd > div.RH5hzf.RLS9Fe > div > div.o3Dpx > div:nth-child($) > div > div > div.PY6Xd`;
  static readonly iterableSelectors: string[] = [
    this.inputSelector,
    this.checkBoxSelector,  
    this.textAreaSelector,
    this.multiChoiceSelector,
    this.dropdownSelector,
    this.linearScaleSelector
  ]; 
} 

export { Constants };
