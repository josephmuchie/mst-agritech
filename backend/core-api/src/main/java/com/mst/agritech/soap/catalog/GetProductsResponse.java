package com.mst.agritech.soap.catalog;

import jakarta.xml.bind.annotation.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@XmlRootElement(name = "GetProductsResponse", namespace = CatalogNamespace.NS)
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GetProductsResponse", namespace = CatalogNamespace.NS, propOrder = {"product"})
public class GetProductsResponse {
    @XmlElement(name = "product", namespace = CatalogNamespace.NS)
    private List<SoapProduct> product = new ArrayList<>();
}
